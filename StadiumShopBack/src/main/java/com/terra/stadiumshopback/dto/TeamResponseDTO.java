package com.terra.stadiumshopback.dto;

import com.terra.stadiumshopback.entity.TeamType;
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
public class TeamResponseDTO {

    private Long id;

    private String name;

    private TeamType type;

    private String country;
}
