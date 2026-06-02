package com.terra.stadiumshopback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponseDTO {

    private long totalProducts;

    private long totalOrders;

    private long pendingOrders;

    private BigDecimal totalRevenue;
}
