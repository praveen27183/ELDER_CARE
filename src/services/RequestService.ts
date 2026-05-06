export interface ServiceRequest {
    id: string;
    elderId?: string;
    elderName: string;
    taskType: string;
    location: string;
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    urgent: boolean;
    timestamp: number;
    message?: string;
    acceptedVolunteer?: string;
    acceptedVolunteerId?: string;
    emergency_severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

type Subscriber = (requests: ServiceRequest[]) => void;

class RequestService {
    private requests: ServiceRequest[] = [];
    private subscribers: Subscriber[] = [];

    constructor() {
        // Only run in browser
        if (typeof window !== 'undefined') {
            this.loadStoredRequests();
        }
    }

    loadStoredRequests() {
        const stored = localStorage.getItem('service_requests');
        if (stored) {
            try {
                this.requests = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse stored requests", e);
                this.requests = this.getMockRequests();
            }
        } else {
            this.requests = this.getMockRequests();
            this.saveRequests();
        }
        this.notify();
    }

    private getMockRequests(): ServiceRequest[] {
        return [
            {
                id: '1',
                elderName: 'Rajesh Kumar',
                taskType: 'Medicine Delivery',
                location: 'Anna Nagar',
                status: 'pending',
                urgent: true,
                timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
                message: 'Need blood pressure medicines urgently.',
                emergency_severity: 'HIGH',
                coordinates: { latitude: 13.0995, longitude: 80.2109 }
            },
            {
                id: '2',
                elderName: 'Meena Iyer',
                taskType: 'Grocery Shopping',
                location: 'T. Nagar',
                status: 'accepted',
                urgent: false,
                timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
                acceptedVolunteer: 'Suresh V',
                emergency_severity: 'LOW',
                coordinates: { latitude: 13.0347, longitude: 80.2350 }
            },
            {
                id: '3',
                elderName: 'Prakash Raj',
                taskType: 'Companion Walk',
                location: 'Adyar',
                status: 'completed',
                urgent: false,
                timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
                acceptedVolunteer: 'Anitha R',
                emergency_severity: 'MEDIUM',
                coordinates: { latitude: 12.9975, longitude: 80.2511 }
            }
        ];
    }

    private saveRequests() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('service_requests', JSON.stringify(this.requests));
        }
    }

    private notify() {
        this.subscribers.forEach(sub => sub([...this.requests]));
    }

    subscribe(callback: Subscriber) {
        this.subscribers.push(callback);
        callback([...this.requests]);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    addRequest(request: Omit<ServiceRequest, 'id' | 'timestamp' | 'status'>) {
        const newRequest: ServiceRequest = {
            ...request,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            status: 'pending'
        };
        this.requests.unshift(newRequest);
        this.saveRequests();
        this.notify();
        return newRequest;
    }

    updateRequestStatus(id: string, status: ServiceRequest['status'], volunteerName?: string) {
        this.requests = this.requests.map(req => {
            if (req.id === id) {
                return { 
                    ...req, 
                    status, 
                    acceptedVolunteer: volunteerName || req.acceptedVolunteer 
                };
            }
            return req;
        });
        this.saveRequests();
        this.notify();
    }

    acceptRequest(id: string, volunteerId: string, volunteerName: string): boolean {
        const index = this.requests.findIndex(r => r.id === id);
        if (index !== -1 && this.requests[index].status === 'pending') {
            this.requests[index] = {
                ...this.requests[index],
                status: 'accepted',
                acceptedVolunteer: volunteerName,
                acceptedVolunteerId: volunteerId
            };
            this.saveRequests();
            this.notify();
            return true;
        }
        return false;
    }
}

const service = new RequestService();
export default service;
