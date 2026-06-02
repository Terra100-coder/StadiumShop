package com.terra.stadiumshopback.dto;

import com.terra.stadiumshopback.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long orderId;

    private BigDecimal totalPrice;

    private OrderStatus status;

    private LocalDateTime createdAt;
}
