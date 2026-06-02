package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.dto.AdminDashboardResponseDTO;
import com.terra.stadiumshopback.entity.Order;
import com.terra.stadiumshopback.entity.OrderStatus;
import com.terra.stadiumshopback.repository.OrderRepository;
import com.terra.stadiumshopback.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private static final Set<OrderStatus> REVENUE_STATUSES = EnumSet.of(
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED
    );

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminDashboardResponseDTO getDashboard() {
        return AdminDashboardResponseDTO.builder()
                .totalProducts(productRepository.count())
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .totalRevenue(calculateTotalRevenue())
                .build();
    }

    private BigDecimal calculateTotalRevenue() {
        return orderRepository.findAll()
                .stream()
                .filter(order -> REVENUE_STATUSES.contains(order.getStatus()))
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
