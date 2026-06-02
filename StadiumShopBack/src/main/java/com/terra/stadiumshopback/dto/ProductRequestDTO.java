package com.terra.stadiumshopback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDTO {

    private String name;

    private String description;

    private BigDecimal price;

    private BigDecimal promoPrice;

    private String mainImage;

    private List<String> gallery;

    private boolean personalizable;

    private boolean active;

    private Long categoryId;

    private Long teamId;
}
