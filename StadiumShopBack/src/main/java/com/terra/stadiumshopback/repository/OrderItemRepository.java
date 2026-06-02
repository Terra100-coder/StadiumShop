package com.terra.stadiumshopback.repository;

import com.terra.stadiumshopback.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
