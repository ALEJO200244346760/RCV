package com.backend.rcv.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Datos Generales y de Riesgo ---
    @Column
    private String fechaRegistro;
    @Column
    private String dni;
    @Column
    private String fechaNacimiento; // Nueva
    @Column
    private String telefono; // Nuevo
    @Column
    private String mail; // Nuevo
    @Column
    private String edad;
    @Column
    private String genero; // Será 'femenino'
    @Column
    private String colesterol; // Se mantiene, por defecto 'No'
    @Column
    private String nivelRiesgo; // Calculado
    @Column(columnDefinition = "TEXT")
    private String imc; // Valor y clasificación

    // --- 1. Historial y Hábitos ---
    
    // Infarto, ACV, Trombosis
    @Column
    private String infartoAcvTrombosis;
    @Column(columnDefinition = "TEXT")
    private String infartoAcvTrombosisTipo; 
    
    // Enfermedad Renal o Insuficiencia Cardíaca
    @Column
    private String enfermedadRenalInsuficiencia;
    @Column(columnDefinition = "TEXT")
    private String enfermedadRenalInsuficienciaTipo;
    
    // Medicación
    @Column
    private String tomaMedicacionDiario;
    @Column(columnDefinition = "TEXT")
    private String medicacionCondiciones; // Hipertensión arterial, Diabetes, Colesterol, Otras
    
    // Hábito de Fumar
    @Column
    private String fumaDiario;
    @Column(columnDefinition = "TEXT")
    private String fumaTipo; // tabaco, otros
    
    // Alcohol, Actividad Física y Sueño
    @Column
    private String consumoAlcoholRiesgo; // Nuevo
    @Column
    private String actividadFisica;
    @Column
    private String horasSueno;
    @Column(columnDefinition = "TEXT")
    private String horasSuenoProblema; // Insomnio, otros
    
    // Estrés y Autoinmunes
    @Column
    private String estresAngustiaCronica; // Nuevo nombre para englobar más
    @Column(columnDefinition = "TEXT")
    private String estresTipo; // estrés, angustia, ansiedad, depresión
    @Column
    private String enfermedadesAutoinmunes; 
    @Column(columnDefinition = "TEXT")
    private String autoinmunesTipo; // lupus, artritis, etc.
    
    // Infecciones
    @Column
    private String hivHepatitis; // Nuevo

    // --- 2. Historial Ginecológico ---
    
    // Mama
    @Column
    private String tumoresMama; // Antecedentes de tumores de mama
    @Column(columnDefinition = "TEXT")
    private String tumoresMamaTratamiento; // radioterapia, quimioterapia, cirugía
    @Column
    private String familiarCancerMama;
    @Column
    private String puncionMama;
    @Column(columnDefinition = "TEXT")
    private String puncionMamaMotivo; // sospecha maligna, quiste de leche, otro
    @Column
    private String mamaDensa; // Sí, No, No recuerdo, No sé lo que es
    
    // Embarazo y Reproducción
    @Column
    private String tuvoHijos;
    @Column(columnDefinition = "TEXT")
    private String complicacionesEmbarazo; // hipertensión arterial gestacional, etc.
    @Column
    private String reproduccionAsistida; // Nuevo
    @Column
    private String abortosSindromeAntifosfolipidico; // Nuevo
    
    // Menstruación y Menopausia
    @Column
    private String menstruacionEdadRiesgo; // Nuevo
    @Column
    private String menstruacionUltima; // Última menstruación hace más de un año
    @Column(columnDefinition = "TEXT")
    private String menopausiaTipo; // histerectomía, menopausia, perimenopausia, ciclos normales, anticonceptivos
    
    // Problemas Funcionales
    @Column
    private String incontinenciaOrgasmos; // Nuevo
    @Column(columnDefinition = "TEXT")
    private String incontinenciaOrgasmosTipo; // incontinencia, falta de orgasmos

    // --- 3. Datos Antropométricos y Clínicos ---
    @Column
    private String peso;
    @Column
    private String talla;
    @Column
    private String cintura;
    @Column
    private String tensionSistolica;
    @Column
    private String tensionDiastolica;

    // Nota: El campo 'ubicacion' ha sido eliminado por no estar en el formulario.
    // Los campos antiguos como 'tumoresGinecologicos', 'cantidadHijos', 
    // 'ciclosMenstruales', 'histerectomia', etc. han sido reemplazados o 
    // consolidados en los campos más específicos de arriba.
}