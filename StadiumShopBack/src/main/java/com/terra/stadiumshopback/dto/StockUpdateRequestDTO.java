package com.terra.stadiumshopback.dto;

import com.terra.stadiumshopback.entity.Size;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockUpdateRequestDTO {

    @NotNull(message = "La taille est obligatoire")
    private Size size;

    @NotNull(message = "La quantité est obligatoire")
    @PositiveOrZero(message = "La quantité doit être supérieure ou égale à 0")
    private Integer quantity;
}
