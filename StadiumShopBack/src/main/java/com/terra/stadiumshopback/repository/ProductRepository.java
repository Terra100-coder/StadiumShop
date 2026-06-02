package com.terra.stadiumshopback.repository;

import com.terra.stadiumshopback.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
