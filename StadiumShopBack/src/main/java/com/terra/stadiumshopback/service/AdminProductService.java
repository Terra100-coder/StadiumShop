package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.dto.AdminProductRequestDTO;
import com.terra.stadiumshopback.dto.AdminProductStockRequestDTO;
import com.terra.stadiumshopback.entity.Category;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.Size;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.entity.Team;
import com.terra.stadiumshopback.exception.ProductInUseException;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.repository.CategoryRepository;
import com.terra.stadiumshopback.repository.OrderItemRepository;
import com.terra.stadiumshopback.repository.ProductRepository;
import com.terra.stadiumshopback.repository.StockSizeRepository;
import com.terra.stadiumshopback.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductService {

    private final ProductRepository productRepository;
    private final StockService stockService;
    private final StockSizeRepository stockSizeRepository;
    private final CategoryRepository categoryRepository;
    private final TeamRepository teamRepository;
    private final OrderItemRepository orderItemRepository;

    public Product createProduct(AdminProductRequestDTO requestDTO) {
        validatePromoPrice(requestDTO);

        Product product = Product.builder()
                .name(requestDTO.getName())
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .promoPrice(requestDTO.getPromoPrice())
                .mainImage(requestDTO.getMainImage())
                .gallery(normalizeGallery(requestDTO.getGallery()))
                .personalizable(requestDTO.isPersonalizable())
                .active(requestDTO.getActive() == null || requestDTO.getActive())
                .category(getCategoryOrThrow(requestDTO.getCategoryId()))
                .team(getTeamOrThrow(requestDTO.getTeamId()))
                .build();

        Product createdProduct = productRepository.save(product);
        replaceStock(createdProduct, requestDTO.getStock());
        return createdProduct;
    }

    public Product updateProduct(Long productId, AdminProductRequestDTO requestDTO) {
        validatePromoPrice(requestDTO);
        Product product = getProductOrThrow(productId);

        product.setName(requestDTO.getName());
        product.setDescription(requestDTO.getDescription());
        product.setPrice(requestDTO.getPrice());
        product.setPromoPrice(requestDTO.getPromoPrice());
        product.setMainImage(requestDTO.getMainImage());
        product.setGallery(normalizeGallery(requestDTO.getGallery()));
        product.setPersonalizable(requestDTO.isPersonalizable());
        if (requestDTO.getActive() != null) {
            product.setActive(requestDTO.getActive());
        }
        product.setCategory(getCategoryOrThrow(requestDTO.getCategoryId()));
        product.setTeam(getTeamOrThrow(requestDTO.getTeamId()));

        Product updatedProduct = productRepository.save(product);
        replaceStock(updatedProduct, requestDTO.getStock());
        return updatedProduct;
    }

    public void deleteProduct(Long productId) {
        Product product = getProductOrThrow(productId);

        if (orderItemRepository.existsByProductId(productId)) {
            throw new ProductInUseException("Le produit ne peut pas être supprimé car il est utilisé dans une commande");
        }

        stockSizeRepository.deleteByProductId(productId);
        productRepository.delete(product);
    }

    public Product activateProduct(Long productId) {
        Product product = getProductOrThrow(productId);
        product.setActive(true);

        return productRepository.save(product);
    }

    public Product deactivateProduct(Long productId) {
        Product product = getProductOrThrow(productId);
        product.setActive(false);

        return productRepository.save(product);
    }

    public StockSize updateStock(Long productId, Size size, Integer quantity) {
        return stockService.updateStock(productId, size, quantity);
    }

    @Transactional(readOnly = true)
    public List<StockSize> getStockByProductId(Long productId) {
        return stockService.getStockByProductId(productId);
    }

    private Product getProductOrThrow(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    private Category getCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    private Team getTeamOrThrow(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
    }

    private void replaceStock(Product product, List<AdminProductStockRequestDTO> requestedStock) {
        List<AdminProductStockRequestDTO> stock = requestedStock == null ? List.of() : requestedStock;
        Set<Size> requestedSizes = new HashSet<>();

        for (AdminProductStockRequestDTO stockItem : stock) {
            if (!requestedSizes.add(stockItem.getSize())) {
                throw new IllegalArgumentException("Une taille ne peut être présente qu'une seule fois dans le stock");
            }
        }

        Map<Size, StockSize> existingBySize = new EnumMap<>(Size.class);
        for (StockSize existingStock : stockSizeRepository.findByProductId(product.getId())) {
            existingBySize.put(existingStock.getSize(), existingStock);
        }

        List<StockSize> toDelete = existingBySize.entrySet().stream()
                .filter(entry -> !requestedSizes.contains(entry.getKey()))
                .map(Map.Entry::getValue)
                .toList();
        stockSizeRepository.deleteAll(toDelete);

        for (AdminProductStockRequestDTO stockItem : stock) {
            StockSize stockSize = existingBySize.getOrDefault(
                    stockItem.getSize(),
                    StockSize.builder().product(product).size(stockItem.getSize()).build()
            );
            stockSize.setQuantity(stockItem.getQuantity());
            stockSizeRepository.save(stockSize);
        }
    }

    private List<String> normalizeGallery(List<String> gallery) {
        return gallery == null ? new ArrayList<>() : new ArrayList<>(gallery);
    }

    private void validatePromoPrice(AdminProductRequestDTO requestDTO) {
        if (requestDTO.getPromoPrice() != null && requestDTO.getPromoPrice().compareTo(requestDTO.getPrice()) >= 0) {
            throw new IllegalArgumentException("Le prix promotionnel doit être strictement inférieur au prix");
        }
    }
}
