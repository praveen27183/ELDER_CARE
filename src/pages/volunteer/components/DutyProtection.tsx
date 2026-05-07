import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDuty } from '../context/DutyContext';
import { Power, AlertTriangle } from 'lucide-react';

interface DutyProtectionProps {
    children: React.ReactNode;
}

export default function DutyProtection({ children }: DutyProtectionProps) {
    return <>{children}</>;
}
