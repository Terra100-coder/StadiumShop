package com.terra.stadiumshopback.repository;

import com.terra.stadiumshopback.entity.Order;
import com.terra.stadiumshopback.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    long countByStatus(OrderStatus status);
}
