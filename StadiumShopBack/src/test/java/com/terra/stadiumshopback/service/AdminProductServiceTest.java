package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.dto.AdminProductRequestDTO;
import com.terra.stadiumshopback.dto.AdminProductStockRequestDTO;
import com.terra.stadiumshopback.entity.Category;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.Size;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.entity.Team;
import com.terra.stadiumshopback.exception.ProductInUseException;
import com.terra.stadiumshopback.repository.CategoryRepository;
import com.terra.stadiumshopback.repository.OrderItemRepository;
import com.terra.stadiumshopback.repository.ProductRepository;
import com.terra.stadiumshopback.repository.StockSizeRepository;
import com.terra.stadiumshopback.repository.TeamRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private StockService stockService;
    @Mock
    private StockSizeRepository stockSizeRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private AdminProductService adminProductService;

    @Test
    void createProductDefaultsToActiveAndCreatesRequestedStock() {
        Category category = Category.builder().id(1L).name("Clubs").slug("clubs").build();
        Team team = Team.builder().id(2L).name("Paris").build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(teamRepository.findById(2L)).thenReturn(Optional.of(team));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(10L);
            return product;
        });
        when(stockSizeRepository.findByProductId(10L)).thenReturn(List.of());

        Product product = adminProductService.createProduct(validRequest());

        assertThat(product.isActive()).isTrue();
        ArgumentCaptor<StockSize> stockCaptor = ArgumentCaptor.forClass(StockSize.class);
        verify(stockSizeRepository).save(stockCaptor.capture());
        assertThat(stockCaptor.getValue().getSize()).isEqualTo(Size.M);
        assertThat(stockCaptor.getValue().getQuantity()).isEqualTo(8);
    }

    @Test
    void createProductRejectsPromoPriceEqualToPrice() {
        AdminProductRequestDTO request = validRequest();
        request.setPromoPrice(new BigDecimal("89.99"));

        assertThatThrownBy(() -> adminProductService.createProduct(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prix promotionnel");
        verify(productRepository, never()).save(any());
    }

    @Test
    void deleteProductReferencedByOrderIsRejected() {
        Product product = Product.builder().id(10L).build();
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(orderItemRepository.existsByProductId(10L)).thenReturn(true);

        assertThatThrownBy(() -> adminProductService.deleteProduct(10L))
                .isInstanceOf(ProductInUseException.class);
        verify(productRepository, never()).delete(any());
    }

    private AdminProductRequestDTO validRequest() {
        return AdminProductRequestDTO.builder()
                .name("Maillot domicile")
                .price(new BigDecimal("89.99"))
                .mainImage("https://example.test/main.jpg")
                .categoryId(1L)
                .teamId(2L)
                .stock(List.of(AdminProductStockRequestDTO.builder().size(Size.M).quantity(8).build()))
                .build();
    }
}
