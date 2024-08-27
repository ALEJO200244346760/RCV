package com.backend.rcv.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String fechaRegistro;
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
    @Column
    private String peso;
    @Column
    private String talla;
    @Column
    private String imc;
    @Column
    private String hipertenso;
    @Column
    private String infarto;
    @Column
    private String acv;
}
