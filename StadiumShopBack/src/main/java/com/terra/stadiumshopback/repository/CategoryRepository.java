package com.terra.stadiumshopback.repository;

import com.terra.stadiumshopback.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
