package com.backend.rcv.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String ubicacion;
    @Column
    private String edad;
    @Column
    private String genero;
    @Column
    private String diabetes;
    @Column
    private String fumador;
    @Column
    private String presionArterial;
    @Column
    private String colesterol;
    @Column
    private String nivelRiesgo;

}
