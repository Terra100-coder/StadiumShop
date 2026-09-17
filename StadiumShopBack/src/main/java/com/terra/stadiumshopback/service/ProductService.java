package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.dto.ProductResponseDTO;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.mapper.ProductMapper;
import com.terra.stadiumshopback.repository.ProductRepository;
import com.terra.stadiumshopback.repository.StockSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final StockSizeRepository stockSizeRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponseDTOWithStock)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        return toResponseDTOWithStock(getProductOrThrow(id));
    }

    private Product getProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private ProductResponseDTO toResponseDTOWithStock(Product product) {
        List<StockSize> stockSizes = stockSizeRepository.findByProductId(product.getId());

        return productMapper.toResponseDTO(product, stockSizes);
    }

}
