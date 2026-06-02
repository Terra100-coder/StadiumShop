package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.Size;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.exception.InsufficientStockException;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.repository.ProductRepository;
import com.terra.stadiumshopback.repository.StockSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StockService {

    private final StockSizeRepository stockSizeRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<StockSize> getStockByProductId(Long productId) {
        getProductOrThrow(productId);

        return stockSizeRepository.findByProductId(productId);
    }

    public StockSize updateStock(Long productId, Size size, Integer quantity) {
        validateQuantity(quantity);
        Product product = getProductOrThrow(productId);

        StockSize stockSize = stockSizeRepository.findByProductIdAndSize(productId, size)
                .orElseGet(() -> StockSize.builder()
                        .product(product)
                        .size(size)
                        .build());

        stockSize.setQuantity(quantity);

        return stockSizeRepository.save(stockSize);
    }

    @Transactional(readOnly = true)
    public boolean checkAvailability(Long productId, Size size, Integer quantity) {
        validateQuantity(quantity);
        getProductOrThrow(productId);

        StockSize stockSize = stockSizeRepository.findByProductIdAndSize(productId, size)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Stock not found for product id: " + productId + " and size: " + size
                ));

        if (stockSize.getQuantity() < quantity) {
            throw new InsufficientStockException(
                    "Insufficient stock for product id: " + productId + " and size: " + size
            );
        }

        return true;
    }

    private Product getProductOrThrow(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new IllegalArgumentException("Quantity must be greater than or equal to 0");
        }
    }
}
