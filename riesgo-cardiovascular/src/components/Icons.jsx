// src/components/Icons.jsx
import React from 'react';
import {
    FaArrowLeft,
    FaEye,
    FaPen,
    FaTrash,
    FaCheck,
    FaTimes,
    FaHeart,
    FaPlus,
    FaUser,
    FaSave
} from 'react-icons/fa';

// Puedes personalizar todos con props (ej: tamaño, color)
export const ArrowLeftIcon = (props) => <FaArrowLeft {...props} />;
export const EyeIcon = (props) => <FaEye {...props} />;
export const PencilIcon = (props) => <FaPen {...props} />;
export const TrashIcon = (props) => <FaTrash {...props} />;
export const CheckIcon = (props) => <FaCheck {...props} />;
export const CloseIcon = (props) => <FaTimes {...props} />;
export const HeartIcon = (props) => <FaHeart {...props} />;
export const PlusIcon = (props) => <FaPlus {...props} />;
export const UserIcon = (props) => <FaUser {...props} />;
export const SaveIcon = (props) => <FaSave {...props} />;
