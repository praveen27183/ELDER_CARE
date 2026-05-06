import { useState } from 'react';
import { 
    Mail, 
    Phone, 
    MessageCircle, 
    Book, 
    HelpCircle,
    ClipboardList,
    DollarSign,
    Bug,
    User,
    AlertTriangle,
    HelpCircle as QuestionIcon,
    Video,
    Shield,
    FileText,
    X,
    Send
} from 'lucide-react';

interface IssueReport {
    category: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    userEmail?: string;
}

export default function VolunteerSupport() {
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState<any>(null);

    // Handler functions
    const handleCallSupport = (phoneNumber: string) => {
        window.open(`tel:${phoneNumber}`, '_self');
    };

    const handleEmailSupport = (email: string) => {
        window.open(`mailto:${email}?subject=ElderAssist Support Request&body=Please describe your issue here...`, '_self');
    };

    const handleStartChat = () => {
        // In a real app, this would open a chat widget or navigate to chat page
        alert('Live chat feature would open here. Available 9 AM - 9 PM');
    };

    const handleResourceClick = (resourceType: string) => {
        const resources = {
            handbook: {
                title: 'Volunteer Handbook',
                subtitle: 'Complete guide to volunteering',
                content: `
# Volunteer Handbook

## Welcome to ElderAssist!

Thank you for joining our community of compassionate volunteers dedicated to supporting elderly citizens in our community.

## Getting Started

### 1. Profile Setup
- Complete your personal information
- Add your skills and expertise
- Set your availability hours
- Verify your contact details

### 2. Understanding the Platform
- Dashboard overview
- Task management system
- Communication tools
- Rating and feedback system

## Volunteering Guidelines

### Core Responsibilities
- Provide compassionate care and support
- Maintain professional boundaries
- Respect privacy and confidentiality
- Report concerns promptly

### Communication Best Practices
- Speak clearly and patiently
- Listen actively to understand needs
- Use respectful language
- Confirm understanding before proceeding

## Task Types

### 1. Medical Assistance
- Medicine delivery
- Doctor appointment accompaniment
- Medical emergency response
- Health monitoring

### 2. Daily Support
- Grocery shopping
- Household help
- Meal preparation
- Companionship visits

### 3. Technical Support
- Device setup and troubleshooting
- Digital literacy training
- Online service assistance

## Safety Protocols

### Personal Safety
- Trust your instincts
- Inform someone about your visits
- Keep emergency contacts handy
- Avoid risky situations

### Elder Safety
- Fall prevention awareness
- Medication safety checks
- Home safety assessments
- Emergency response procedures

## Building Trust

### Professional Conduct
- Be punctual and reliable
- Dress appropriately
- Maintain positive attitude
- Follow through on commitments

### Communication Excellence
- Active listening
- Empathy and patience
- Clear explanations
- Regular check-ins

## Rewards and Recognition

### Earning System
- Task-based compensation
- Performance bonuses
- Referral rewards
- Milestone achievements

### Rating System
- Elder feedback integration
- Performance metrics
- Trust score calculation
- Tier advancement

## Community Impact

### Making a Difference
- Real stories of impact
- Community statistics
- Success metrics
- Personal growth opportunities

## Support Resources

### 24/7 Support
- Emergency hotline: 1800-ELDER-01
- Live chat support
- Email assistance
- Peer support network

## Frequently Asked Questions

### Q: How do I handle difficult situations?
A: Stay calm, assess the situation, and contact support if needed.

### Q: What if I'm unable to complete a task?
A: Communicate promptly and reschedule if appropriate.

### Q: How are payments processed?
A: Payments are processed within 24 hours of task completion.

## Contact Information

- Support: 1800-ELDER-01
- Email: support@elderassist.com
- Emergency: 108 (Medical), 100 (Police), 101 (Fire)

Thank you for being part of the ElderAssist family!
                `
            },
            guidelines: {
                title: 'Task Guidelines',
                subtitle: 'Best practices and protocols',
                content: `
# Task Guidelines & Protocols

## Before Accepting a Task

### 1. Review Requirements
- Read task description carefully
- Check time commitment
- Verify location accessibility
- Assess skill requirements

### 2. Personal Preparation
- Confirm availability
- Plan transportation
- Prepare necessary tools
- Dress appropriately

## During Task Execution

### Arrival Protocol
- Arrive 5-10 minutes early
- Introduce yourself clearly
- Verify elder's identity
- Explain the task scope

### Communication Guidelines
- Speak clearly and slowly
- Use simple language
- Maintain eye contact
- Show patience and empathy

### Task Execution Steps
1. **Assessment**: Understand specific needs
2. **Planning**: Break down into manageable steps
3. **Execution**: Perform task methodically
4. **Verification**: Ensure completion to satisfaction
5. **Documentation**: Record important details

## Specific Task Protocols

### Medical Assistance
- Never administer medication without proper training
- Document all medical observations
- Report concerning symptoms immediately
- Follow doctor's instructions precisely

### Grocery Shopping
- Verify shopping list items
- Check expiration dates
- Handle payment securely
- Provide receipts

### Household Help
- Respect personal property
- Ask before moving items
- Clean up after tasks
- Report any damages

### Companionship
- Engage in meaningful conversation
- Respect privacy boundaries
- Avoid sensitive topics unless initiated
- Be a good listener

## Safety Protocols

### Personal Safety
- Keep phone charged and accessible
- Share location with trusted contact
- Have emergency contacts ready
- Trust your instincts

### Elder Safety
- Fall prevention awareness
- Medication safety
- Emergency procedures
- Health monitoring

## Documentation Requirements

### Task Completion
- Take before/after photos (when appropriate)
- Note any issues or concerns
- Record time spent
- Get elder confirmation

### Incident Reporting
- Document any accidents
- Note unusual observations
- Report safety concerns
- Follow escalation procedures

## Quality Standards

### Service Excellence
- Professional conduct at all times
- Attention to detail
- Proactive problem-solving
- Continuous improvement

### Communication Standards
- Clear and respectful language
- Active listening
- Regular status updates
- Proper documentation

## Problem Resolution

### Common Issues
- Miscommunication: Clarify and confirm
- Delays: Communicate promptly
- Additional needs: Assess and accommodate
- Safety concerns: Prioritize and report

### Escalation Procedures
1. Assess severity
2. Contact support if needed
3. Document the issue
4. Follow up appropriately

## Post-Task Procedures

### Completion Checklist
- Task fully completed
- Area cleaned and organized
- Elder satisfied with service
- All documentation complete

### Follow-up
- Thank the elder
- Schedule future tasks if needed
- Provide feedback to platform
- Update availability status

## Professional Development

### Continuous Learning
- Attend training sessions
- Learn from feedback
- Share best practices
- Stay updated on protocols

### Skill Enhancement
- First aid certification
- Communication skills
- Technical training
- Cultural sensitivity

## Compliance Requirements

### Legal Obligations
- Maintain confidentiality
- Follow privacy laws
- Report abuse/neglect
- Adhere to platform policies

### Ethical Standards
- Respect autonomy
- Avoid conflicts of interest
- Maintain boundaries
- Act with integrity

## Performance Metrics

### Quality Indicators
- Task completion rate
- Elder satisfaction scores
- Response time
- Professional conduct

### Improvement Areas
- Feedback implementation
- Skill development
- Efficiency enhancement
- Service expansion

Remember: You are not just completing tasks - you're building relationships and making a real difference in someone's life.
                `
            },
            safety: {
                title: 'Safety Guidelines',
                subtitle: 'Important safety information',
                content: `
# Safety Guidelines for Volunteers

## Personal Safety First

### Before You Go
- **Inform Someone**: Always let a friend or family member know where you're going and when you expect to return
- **Charge Your Phone**: Ensure your phone is fully charged and portable charger available
- **Share Location**: Use location sharing with trusted contacts
- **Plan Your Route**: Know the exact address and plan safe transportation

### During Visits
- **Trust Your Instincts**: If something feels wrong, it probably is - leave immediately
- **Keep Exits Clear**: Always know your exit routes
- **Stay Alert**: Be aware of your surroundings
- **Set Time Limits**: Establish clear start and end times

## Emergency Procedures

### Medical Emergencies
**Call 108 immediately for:**
- Chest pain or difficulty breathing
- Severe bleeding
- Loss of consciousness
- Stroke symptoms (FAST: Face, Arms, Speech, Time)
- Severe injuries

**While Waiting for Help:**
- Stay calm and reassure the elder
- Follow first aid protocols if trained
- Don't move the person unless necessary
- Gather medical information and medications

### Non-Medical Emergencies
**Police - 100:**
- Threats or violence
- Theft or burglary
- Suspicious activity
- Abuse or neglect

**Fire Department - 101:**
- Fire or smoke
- Gas leaks
- Structural damage
- Natural disasters

## Elder Safety Protocols

### Fall Prevention
- **Assess Environment**: Look for tripping hazards (rugs, cords, clutter)
- **Lighting**: Ensure adequate lighting, especially in bathrooms and stairs
- **Footwear**: Check that elders wear proper, non-slip footwear
- **Assistance**: Provide steady support during walking or transfers

### Medication Safety
- **Never Administer**: Do not give medication unless specifically trained and authorized
- **Documentation**: Note medication times and dosages if asked to observe
- **Storage**: Ensure medications are stored properly
- **Concerns**: Report any medication concerns to family or healthcare providers

### Home Safety Assessment
- **Fire Safety**: Check smoke detectors and escape routes
- **Kitchen Safety**: Look for gas leaks, faulty appliances
- **Bathroom Safety**: Check for grab bars, non-slip mats
- **General Hazards**: Identify and report safety concerns

## Health and Hygiene

### Personal Protective Equipment
- **Masks**: Wear masks if requested or during illness
- **Gloves**: Use gloves for personal care tasks
- **Hand Sanitizer**: Keep hands clean and sanitized
- **First Aid Kit**: Carry basic first aid supplies

### Illness Protocols
- **Stay Home**: Don't visit if you're sick
- **Reschedule**: Postpone visits if you have symptoms
- **Communicate**: Inform the platform about illness
- **Recovery**: Return only when fully recovered

## Boundaries and Professionalism

### Physical Boundaries
- **Appropriate Touch**: Limit physical contact to necessary assistance
- **Privacy**: Respect personal space and privacy
- **Alone Time**: Avoid being alone in private areas
- **Comfort Zones**: Be aware of comfort levels

### Emotional Boundaries
- **Professional Distance**: Maintain appropriate emotional distance
- **Personal Information**: Don't share excessive personal details
- **Gifts**: Avoid accepting expensive gifts
- **Relationships**: Keep relationships professional

## Communication Safety

### Verification
- **Identity Confirmation**: Verify elder's identity before providing services
- **Authorized Contacts**: Only communicate with authorized family members
- **Platform Communication**: Use official platform for primary communication
- **Documentation**: Keep records of important communications

### Red Flags
- **Pressure Tactics**: Don't respond to pressure for quick decisions
- **Financial Requests**: Never handle money unless part of official task
- **Isolation**: Avoid situations where you're isolated with strangers
- **Inappropriate Requests**: Decline inappropriate or unsafe requests

## Transportation Safety

### Getting There
- **Public Transport**: Use reliable, well-lit transportation
- **Personal Vehicle**: Ensure vehicle is maintained and fueled
- **Ride Services**: Use reputable ride-sharing services
- **Walking**: Avoid walking alone in unfamiliar areas

### Parking and Access
- **Well-Lit Areas**: Park in safe, well-lit areas
- **Secure Locking**: Lock your vehicle securely
- **Access Routes**: Use main entrances and well-traveled paths
- **Visibility**: Stay in visible, public areas

## Documentation and Reporting

### Incident Reporting
**Report Immediately:**
- Any accidents or injuries
- Safety concerns
- Abusive or neglectful situations
- Suspicious activities

**Documentation Should Include:**
- Date, time, and location
- People involved
- Description of incident
- Actions taken
- Witnesses (if any)

### Regular Safety Checks
- **Environment**: Regularly assess home safety
- **Health**: Monitor elder's health status
- **Equipment**: Check safety equipment functionality
- **Communication**: Maintain regular contact with support

## Mental and Emotional Well-being

### Stress Management
- **Recognize Burnout**: Be aware of emotional exhaustion signs
- **Take Breaks**: Schedule regular rest periods
- **Seek Support**: Talk to peers or professionals when needed
- **Self-Care**: Prioritize your own health and well-being

### Dealing with Difficult Situations
- **Stay Calm**: Maintain composure in stressful situations
- **Seek Help**: Don't hesitate to call for assistance
- **Document**: Record difficult interactions
- **Debrief**: Talk through challenging experiences

## Legal and Compliance

### Mandatory Reporting
- **Abuse**: Report any suspected elder abuse immediately
- **Neglect**: Document and report neglect situations
- **Exploitation**: Report financial or other exploitation
- **Self-Harm**: Report any self-harm or suicidal tendencies

### Privacy and Confidentiality
- **HIPAA Compliance**: Maintain medical privacy standards
- **Personal Information**: Protect personal and financial information
- **Photos/Videos**: Don't take photos without permission
- **Social Media**: Don't share identifying information

## Emergency Contacts

### Always Keep Available:
- **ElderAssist Support**: 1800-ELDER-01
- **Medical Emergency**: 108
- **Police**: 100
- **Fire Department**: 101
- **Personal Emergency Contact**: [Your emergency contact]
- **Family Contact**: [Elder's family contact]

## Remember: Your Safety Comes First

You cannot help others if you're not safe yourself. Always prioritize your personal safety and well-being. If a situation feels unsafe, remove yourself immediately and contact support.

**When in doubt, call for help!**
                `
            },
            tutorials: {
                title: 'Video Tutorials',
                subtitle: 'Step-by-step video guides',
                content: `
# Video Tutorials Library

## Getting Started Videos

### 1. Platform Orientation (5 min)
- Dashboard overview
- Navigation basics
- Profile setup
- Task acceptance process

### 2. Mobile App Tutorial (8 min)
- App installation and setup
- Push notification settings
- On-the-go task management
- Emergency features

## Task-Specific Tutorials

### Medical Assistance
- **Medicine Delivery Protocol** (12 min)
- **Doctor Visit Accompaniment** (10 min)
- **Emergency Response Basics** (15 min)
- **Health Monitoring Techniques** (8 min)

### Daily Support
- **Grocery Shopping Best Practices** (7 min)
- **Household Help Guidelines** (9 min)
- **Meal Preparation Safety** (11 min)
- **Companionship Techniques** (6 min)

### Technical Support
- **Device Setup for Seniors** (13 min)
- **Smartphone Training Methods** (10 min)
- **Online Service Navigation** (8 min)
- **Troubleshooting Common Issues** (12 min)

## Communication Skills

### 1. Effective Communication (10 min)
- Active listening techniques
- Speaking clearly and patiently
- Non-verbal communication
- Building rapport

### 2. Handling Difficult Conversations (12 min)
- De-escalation techniques
- Managing resistance
- Cultural sensitivity
- Conflict resolution

### 3. Emergency Communication (8 min)
- Clear emergency reporting
- Information gathering
- Staying calm under pressure
- Coordinating with responders

## Safety Training Videos

### Personal Safety
- **Situational Awareness** (9 min)
- **Self-Defense Basics** (15 min)
- **Emergency Evacuation** (7 min)
- **Travel Safety** (11 min)

### Elder Safety
- **Fall Prevention** (10 min)
- **Home Safety Assessment** (12 min)
- **Medication Safety** (8 min)
- **Emergency Response** (14 min)

## Advanced Skills

### Medical Procedures
- **Basic First Aid** (20 min)
- **CPR for Seniors** (18 min)
- **Choking Assistance** (6 min)
- **Wound Care** (9 min)

### Technical Skills
- **Smart Home Setup** (16 min)
- **Tablet Training** (11 min)
- **Video Calling Setup** (8 min)
- **Online Banking Help** (13 min)

## Specialized Care

### Dementia Care
- **Understanding Dementia** (15 min)
- **Communication Strategies** (12 min)
- **Behavior Management** (18 min)
- **Creating Safe Environments** (10 min)

### Mobility Assistance
- **Safe Transfer Techniques** (14 min)
- **Walker and Cane Usage** (8 min)
- **Wheelchair Assistance** (11 min)
- **Exercise for Seniors** (9 min)

## Platform Features

### Task Management
- **Task Acceptance Best Practices** (7 min)
- **Time Management** (9 min)
- **Documentation Requirements** (6 min)
- **Feedback System** (5 min)

### Communication Tools
- **In-App Messaging** (4 min)
- **Video Call Features** (6 min)
- **Emergency Alerts** (8 min)
- **Schedule Management** (7 min)

## Certification Courses

### Basic Certification (2 hours total)
1. Volunteer Orientation (30 min)
2. Safety Protocols (30 min)
3. Communication Basics (30 min)
4. Platform Training (30 min)

### Advanced Certification (4 hours total)
1. Advanced Medical Support (60 min)
2. Emergency Response (60 min)
3. Specialized Care (60 min)
4. Leadership Skills (60 min)

## Quick Reference Videos

### 2-Minute Tips
- Quick medication reminders
- Emergency numbers overview
- Basic first aid reminders
- Communication quick tips

### 5-Mute Guides
- Task setup checklist
- Safety protocol review
- Documentation quick guide
- Platform feature updates

## Live Training Sessions

### Weekly Live Streams
- **Mondays**: New Volunteer Orientation
- **Wednesdays**: Advanced Skills Workshop
- **Fridays**: Q&A with Experienced Volunteers

### Monthly Special Topics
- Guest speakers from healthcare
- Advanced medical procedures
- Legal and compliance updates
- Community impact stories

## Assessment and Testing

### Knowledge Checks
- Short quizzes after each video
- Practical skill assessments
- Scenario-based testing
- Peer review sessions

### Certification Requirements
- 80% passing score on assessments
- Practical demonstration of skills
- Mentor feedback evaluation
- Community service hours

## Resource Materials

### Downloadable Guides
- Video transcripts
- Step-by-step checklists
- Reference cards
- Quick reference sheets

### Interactive Elements
- Knowledge quizzes
- Scenario simulations
- Skill practice modules
- Progress tracking

## Community Features

### Discussion Forums
- Video discussion threads
- Experience sharing
- Tips and tricks
- Peer support

### Mentorship Program
- Video feedback from mentors
- Skill demonstration reviews
- Personalized guidance
- Career development

## Technical Requirements

### Device Compatibility
- Desktop/laptop access
- Mobile app features
- Offline viewing options
- Download capabilities

### Accessibility Features
- Closed captions
- Audio descriptions
- Multiple language options
- Screen reader compatibility

## Updates and Maintenance

### Regular Updates
- Monthly new content
- Quarterly protocol updates
- Annual comprehensive review
- Emergency protocol updates

### User Feedback Integration
- Comment and rating system
- Suggestion platform
- User-generated content
- Community contributions

## Support Resources

### Technical Support
- Video playback issues
- Download problems
- Account access
- Device compatibility

### Content Support
- Subject matter experts
- Additional resources
- Clarification requests
- Further learning paths

Remember: These videos are designed to supplement, not replace, hands-on training and real-world experience. Always prioritize safety and follow established protocols.
                `
            }
        };

        setSelectedResource(resources[resourceType as keyof typeof resources] || resources.handbook);
        setShowResourceModal(true);
    };

    const handleReportIssue = (category: string) => {
        setSelectedCategory(category);
        setShowReportModal(true);
    };

    const handleSubmitReport = async () => {
        if (!issueDescription.trim()) {
            alert('Please describe your issue before submitting.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Get user info from localStorage
            const userData = localStorage.getItem('user');
            const userEmail = userData ? JSON.parse(userData).email : 'unknown@example.com';
            
            const report: IssueReport = {
                category: selectedCategory,
                description: issueDescription,
                priority,
                userEmail
            };

            // In a real app, send this to your backend API
            console.log('Submitting report:', report);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('Your issue has been reported successfully! Our support team will contact you soon.');
            
            // Reset form
            setIssueDescription('');
            setPriority('medium');
            setShowReportModal(false);
            
        } catch (error) {
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const supportCategories = [
        {
            title: 'Task Issues',
            description: 'Problems with active or completed tasks',
            icon: ClipboardList
        },
        {
            title: 'Payment Questions',
            description: 'Issues with earnings and payments',
            icon: DollarSign
        },
        {
            title: 'App Technical Issues',
            description: 'Bugs and technical problems',
            icon: Bug
        },
        {
            title: 'Account Issues',
            description: 'Profile and account management',
            icon: User
        },
        {
            title: 'Safety Concerns',
            description: 'Emergency and safety-related issues',
            icon: AlertTriangle
        },
        {
            title: 'General Questions',
            description: 'Other inquiries and suggestions',
            icon: QuestionIcon
        }
    ];

    const faqs = [
        {
            question: 'How do I get paid for completed tasks?',
            answer: 'Payments are processed within 24 hours of task completion. You can view your earnings in the Rewards/Earnings section and withdraw them to your registered bank account.'
        },
        {
            question: 'What should I do in an emergency situation?',
            answer: 'In case of emergency, immediately call 108 for medical assistance, 100 for police, or 101 for fire department. Also notify ElderAssist support through the emergency hotline 1800-ELDER-01.'
        },
        {
            question: 'How are task ratings calculated?',
            answer: 'Ratings are based on feedback from elders you help, task completion time, and adherence to guidelines. Maintain high ratings to get more task opportunities.'
        },
        {
            question: 'Can I decline a task after accepting it?',
            answer: 'While possible, frequent declines may affect your rating. If you must decline, provide a valid reason and do so as soon as possible.'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Support Options */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Contact Support</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-800">Phone Support</h3>
                        </div>
                        <p className="text-sm text-blue-700 mb-2">24/7 Hotline</p>
                        <button 
                            onClick={() => handleCallSupport('1800-ELDER-01')}
                            className="font-bold text-blue-800 hover:text-blue-900 cursor-pointer underline"
                        >
                            1800-ELDER-01
                        </button>
                    </div>
                    
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-semibold text-emerald-800">Live Chat</h3>
                        </div>
                        <p className="text-sm text-emerald-700 mb-2">Available 9 AM - 9 PM</p>
                        <button 
                            onClick={handleStartChat}
                            className="font-medium text-emerald-800 hover:text-emerald-900 cursor-pointer"
                        >
                            Start Chat →
                        </button>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-purple-800">Email Support</h3>
                        </div>
                        <p className="text-sm text-purple-700 mb-2">Response within 24h</p>
                        <button 
                            onClick={() => handleEmailSupport('support@elderassist.com')}
                            className="font-medium text-purple-800 hover:text-purple-900 cursor-pointer underline"
                        >
                            support@elderassist.com
                        </button>
                    </div>
                </div>

                {/* Support Categories */}
                <h3 className="font-semibold text-slate-800 mb-3">Report an Issue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {supportCategories.map((category, index) => (
                        <button
                            key={index}
                            onClick={() => handleReportIssue(category.title)}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                        >
                            <category.icon className="w-6 h-6 text-slate-600" />
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-800">{category.title}</h4>
                                <p className="text-sm text-slate-600">{category.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-slate-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Frequently Asked Questions</h2>
                </div>
                
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                            <h3 className="font-medium text-slate-800 mb-2">{faq.question}</h3>
                            <p className="text-sm text-slate-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Book className="w-5 h-5 text-slate-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Help Resources</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleResourceClick('handbook')}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                        <Book className="w-8 h-8 text-blue-600" />
                        <div>
                            <h4 className="font-medium text-slate-800">Volunteer Handbook</h4>
                            <p className="text-sm text-slate-600">Complete guide to volunteering</p>
                        </div>
                    </button>
                    <button
                        onClick={() => handleResourceClick('tutorials')}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                        <Video className="w-8 h-8 text-purple-600" />
                        <div>
                            <h4 className="font-medium text-slate-800">Video Tutorials</h4>
                            <p className="text-sm text-slate-600">Step-by-step video guides</p>
                        </div>
                    </button>
                    <button
                        onClick={() => handleResourceClick('guidelines')}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                        <FileText className="w-8 h-8 text-green-600" />
                        <div>
                            <h4 className="font-medium text-slate-800">Task Guidelines</h4>
                            <p className="text-sm text-slate-600">Best practices and protocols</p>
                        </div>
                    </button>
                    <button
                        onClick={() => handleResourceClick('safety')}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                        <Shield className="w-8 h-8 text-red-600" />
                        <div>
                            <h4 className="font-medium text-slate-800">Safety Guidelines</h4>
                            <p className="text-sm text-slate-600">Important safety information</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Report Issue Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Report an Issue</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Issue Category
                                </label>
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-slate-800">{selectedCategory}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Priority Level
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low - Minor issue</option>
                                    <option value="medium">Medium - Needs attention</option>
                                    <option value="high">High - Urgent matter</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Issue Description *
                                </label>
                                <textarea
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                    placeholder="Please describe your issue in detail..."
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReport}
                                    disabled={isSubmitting || !issueDescription.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Content Modal */}
            {showResourceModal && selectedResource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{selectedResource.title}</h3>
                                <p className="text-sm text-slate-600">{selectedResource.subtitle}</p>
                            </div>
                            <button
                                onClick={() => setShowResourceModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="prose prose-slate max-w-none">
                                {selectedResource.content.split('\n').map((line: string, index: number) => {
                                    // Handle markdown-style formatting
                                    if (line.startsWith('# ')) {
                                        return <h1 key={index} className="text-2xl font-bold text-slate-800 mb-4 mt-6">{line.substring(2)}</h1>;
                                    } else if (line.startsWith('## ')) {
                                        return <h2 key={index} className="text-xl font-semibold text-slate-800 mb-3 mt-5">{line.substring(3)}</h2>;
                                    } else if (line.startsWith('### ')) {
                                        return <h3 key={index} className="text-lg font-medium text-slate-800 mb-2 mt-4">{line.substring(4)}</h3>;
                                    } else if (line.startsWith('#### ')) {
                                        return <h4 key={index} className="text-base font-medium text-slate-800 mb-2 mt-3">{line.substring(5)}</h4>;
                                    } else if (line.startsWith('- ')) {
                                        return <li key={index} className="ml-4 text-slate-700 mb-1">{line.substring(2)}</li>;
                                    } else if (line.match(/^\d+\. /)) {
                                        return <li key={index} className="ml-4 text-slate-700 mb-1 list-decimal">{line.substring(line.indexOf(' ') + 1)}</li>;
                                    } else if (line.startsWith('**') && line.endsWith('**')) {
                                        return <p key={index} className="font-semibold text-slate-800 mb-2">{line.slice(2, -2)}</p>;
                                    } else if (line.startsWith('* ') && line.endsWith('*')) {
                                        return <p key={index} className="italic text-slate-700 mb-2">{line.slice(2, -1)}</p>;
                                    } else if (line.trim() === '') {
                                        return <br key={index} />;
                                    } else if (line.startsWith('###Q:')) {
                                        return <p key={index} className="font-semibold text-blue-800 mb-2 mt-4">{line}</p>;
                                    } else if (line.startsWith('###A:')) {
                                        return <p key={index} className="text-slate-700 mb-3 ml-4">{line}</p>;
                                    } else if (line.startsWith('**Call')) {
                                        return <p key={index} className="font-semibold text-red-800 mb-2">{line}</p>;
                                    } else if (line.startsWith('**While')) {
                                        return <p key={index} className="text-slate-700 mb-3 ml-4">{line}</p>;
                                    } else if (line.startsWith('**Police') || line.startsWith('**Fire')) {
                                        return <p key={index} className="font-semibold text-blue-800 mb-2">{line}</p>;
                                    } else if (line.match(/^\*\*[\w\s]+:\*\*/)) {
                                        return <p key={index} className="font-semibold text-slate-800 mb-2">{line}</p>;
                                    } else if (line.match(/^- \*\*/)) {
                                        return <li key={index} className="ml-4 text-slate-700 mb-1 font-medium">{line}</li>;
                                    } else {
                                        return <p key={index} className="text-slate-700 mb-2">{line}</p>;
                                    }
                                })}
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">
                                    Last updated: {new Date().toLocaleDateString()}
                                </p>
                                <button
                                    onClick={() => setShowResourceModal(false)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
