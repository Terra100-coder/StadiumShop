package com.terra.stadiumshopback.mapper;

import com.terra.stadiumshopback.dto.ProductRequestDTO;
import com.terra.stadiumshopback.dto.ProductResponseDTO;
import com.terra.stadiumshopback.dto.StockSizeResponseDTO;
import com.terra.stadiumshopback.entity.Category;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.entity.Team;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequestDTO requestDTO) {
        return Product.builder()
                .name(requestDTO.getName())
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .promoPrice(requestDTO.getPromoPrice())
                .mainImage(requestDTO.getMainImage())
                .gallery(requestDTO.getGallery())
                .personalizable(requestDTO.isPersonalizable())
                .active(requestDTO.isActive())
                .build();
    }

    public ProductResponseDTO toResponseDTO(Product product) {
        return toResponseDTO(product, List.of());
    }

    public ProductResponseDTO toResponseDTO(Product product, List<StockSize> stockSizes) {
        Category category = product.getCategory();
        Team team = product.getTeam();
        List<StockSizeResponseDTO> stock = stockSizes.stream()
                .map(this::toStockSizeResponseDTO)
                .toList();
        boolean available = stockSizes.stream()
                .anyMatch(stockSize -> stockSize.getQuantity() != null && stockSize.getQuantity() > 0);

        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .promoPrice(product.getPromoPrice())
                .mainImage(product.getMainImage())
                .gallery(product.getGallery())
                .personalizable(product.isPersonalizable())
                .active(product.isActive())
                .available(available)
                .createdAt(product.getCreatedAt())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .teamId(team.getId())
                .teamName(team.getName())
                .stock(stock)
                .build();
    }

    private StockSizeResponseDTO toStockSizeResponseDTO(StockSize stockSize) {
        return StockSizeResponseDTO.builder()
                .size(stockSize.getSize())
                .quantity(stockSize.getQuantity())
                .build();
    }
}
