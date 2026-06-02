package com.terra.stadiumshopback.mapper;

import com.terra.stadiumshopback.dto.TeamRequestDTO;
import com.terra.stadiumshopback.dto.TeamResponseDTO;
import com.terra.stadiumshopback.entity.Team;
import org.springframework.stereotype.Component;

@Component
public class TeamMapper {

    public Team toEntity(TeamRequestDTO requestDTO) {
        return Team.builder()
                .name(requestDTO.getName())
                .type(requestDTO.getType())
                .country(requestDTO.getCountry())
                .build();
    }

    public TeamResponseDTO toResponseDTO(Team team) {
        return TeamResponseDTO.builder()
                .id(team.getId())
                .name(team.getName())
                .type(team.getType())
                .country(team.getCountry())
                .build();
    }
}
