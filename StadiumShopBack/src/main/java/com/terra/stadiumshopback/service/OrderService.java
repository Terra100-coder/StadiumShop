package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.entity.Order;
import com.terra.stadiumshopback.entity.OrderItem;
import com.terra.stadiumshopback.entity.OrderStatus;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.exception.InsufficientStockException;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.repository.OrderRepository;
import com.terra.stadiumshopback.repository.ProductRepository;
import com.terra.stadiumshopback.repository.StockSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockSizeRepository stockSizeRepository;

    public Order createOrder(Order order) {
        validateOrderItems(order.getItems());

        List<OrderItem> preparedItems = prepareItems(order.getItems());
        order.clearItems();
        preparedItems.forEach(order::addItem);
        order.setId(null);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(calculateTotal(preparedItems));

        return orderRepository.save(order);
    }

    public Order confirmOrder(Long orderId) {
        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be confirmed");
        }

        for (OrderItem item : order.getItems()) {
            StockSize stockSize = getStockOrThrow(item);
            ensureStockAvailable(stockSize, item);
            stockSize.setQuantity(stockSize.getQuantity() - item.getQuantity());
            stockSizeRepository.save(stockSize);
        }

        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return getOrderOrThrow(orderId);
    }

    private List<OrderItem> prepareItems(List<OrderItem> items) {
        List<OrderItem> preparedItems = new ArrayList<>();

        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + item.getProduct().getId()
                    ));

            StockSize stockSize = getStockOrThrow(product.getId(), item);
            ensureStockAvailable(stockSize, item);

            item.setId(null);
            item.setProduct(product);
            item.setUnitPrice(resolveUnitPrice(product));
            preparedItems.add(item);
        }

        return preparedItems;
    }

    private BigDecimal calculateTotal(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal resolveUnitPrice(Product product) {
        if (product.getPromoPrice() != null) {
            return product.getPromoPrice();
        }

        return product.getPrice();
    }

    private void validateOrderItems(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        for (OrderItem item : items) {
            if (item.getProduct() == null || item.getProduct().getId() == null) {
                throw new IllegalArgumentException("Order item product is required");
            }
            if (item.getSize() == null) {
                throw new IllegalArgumentException("Order item size is required");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Order item quantity must be greater than 0");
            }
        }
    }

    private Order getOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    private StockSize getStockOrThrow(OrderItem item) {
        return getStockOrThrow(item.getProduct().getId(), item);
    }

    private StockSize getStockOrThrow(Long productId, OrderItem item) {
        return stockSizeRepository.findByProductIdAndSize(productId, item.getSize())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Stock not found for product id: " + productId + " and size: " + item.getSize()
                ));
    }

    private void ensureStockAvailable(StockSize stockSize, OrderItem item) {
        if (stockSize.getQuantity() < item.getQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient stock for product id: "
                            + item.getProduct().getId()
                            + " and size: "
                            + item.getSize()
            );
        }
    }
}
