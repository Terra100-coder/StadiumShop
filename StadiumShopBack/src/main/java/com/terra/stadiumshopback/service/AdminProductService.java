package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.Size;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductService {

    private final ProductRepository productRepository;
    private final StockService stockService;

    public Product activateProduct(Long productId) {
        Product product = getProductOrThrow(productId);
        product.setActive(true);

        return productRepository.save(product);
    }

    public Product deactivateProduct(Long productId) {
        Product product = getProductOrThrow(productId);
        product.setActive(false);

        return productRepository.save(product);
    }

    public StockSize updateStock(Long productId, Size size, Integer quantity) {
        return stockService.updateStock(productId, size, quantity);
    }

    private Product getProductOrThrow(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }
}
