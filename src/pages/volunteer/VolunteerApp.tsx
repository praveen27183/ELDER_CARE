import VolunteerDashboard from './VolunteerDashboard';
import { DutyProvider } from './context/DutyContext';

export default function VolunteerApp() {
    return (
        <DutyProvider>
            <VolunteerDashboard />
        </DutyProvider>
    );
}
