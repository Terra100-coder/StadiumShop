package com.terra.stadiumshopback.repository;

import com.terra.stadiumshopback.entity.Size;
import com.terra.stadiumshopback.entity.StockSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockSizeRepository extends JpaRepository<StockSize, Long> {

    List<StockSize> findByProductId(Long productId);

    Optional<StockSize> findByProductIdAndSize(Long productId, Size size);
}
