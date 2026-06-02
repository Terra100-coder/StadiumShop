package com.terra.stadiumshopback.dto;

import com.terra.stadiumshopback.entity.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequestDTO {

    private Long productId;

    private Size size;

    private Integer quantity;

    private String personalizationName;

    private String personalizationNumber;
}
