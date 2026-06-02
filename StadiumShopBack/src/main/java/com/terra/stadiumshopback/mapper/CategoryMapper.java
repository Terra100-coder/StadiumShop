package com.terra.stadiumshopback.mapper;

import com.terra.stadiumshopback.dto.CategoryRequestDTO;
import com.terra.stadiumshopback.dto.CategoryResponseDTO;
import com.terra.stadiumshopback.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequestDTO requestDTO) {
        return Category.builder()
                .name(requestDTO.getName())
                .slug(requestDTO.getSlug())
                .build();
    }

    public CategoryResponseDTO toResponseDTO(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();
    }
}
