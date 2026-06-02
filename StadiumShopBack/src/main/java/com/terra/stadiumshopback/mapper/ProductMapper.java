package com.terra.stadiumshopback.mapper;

import com.terra.stadiumshopback.dto.ProductRequestDTO;
import com.terra.stadiumshopback.dto.ProductResponseDTO;
import com.terra.stadiumshopback.entity.Category;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.Team;
import org.springframework.stereotype.Component;

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
        Category category = product.getCategory();
        Team team = product.getTeam();

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
                .createdAt(product.getCreatedAt())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .teamId(team.getId())
                .teamName(team.getName())
                .build();
    }
}
