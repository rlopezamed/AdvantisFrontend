export type RequirementStatus = 'missing' | 'action_needed' | 'pending' | 'reviewing' | 'completed' | 'rejected';

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  status: RequirementStatus;
  rejectionReason?: string;
  isRequired: boolean;
  dueDate?: string;
  type: 'upload' | 'esign' | 'form' | 'automated';
}

export interface TaskGroup {
  id: string;
  title: string;
  description?: string;
  requirements: Requirement[];
}

export interface Specialist {
  name: string;
  role: string;
  email: string;
  phone: string;
  imageUrl: string;
}

export interface CredentialingApp {
  applicantDetails: {
    name: string;
    role: string;
    facility: string;
    stage: string;
    progressPercentage: number;
    daysLeft: number;
  };
  specialist: Specialist;
  taskGroups: TaskGroup[];
}

export const mockApplication: CredentialingApp = {
  applicantDetails: {
    name: 'Sarah Jenkins',
    role: 'RN Med/Surg',
    facility: 'Mercy General',
    stage: 'Credentialing & Compliance',
    progressPercentage: 40.0,
    daysLeft: 32,
  },
  specialist: {
    name: 'Raul Lopez',
    role: 'Credentialing Specialist',
    email: 'rlopez@advantismed.com',
    phone: '(800) 555-0199',
    imageUrl: 'RL'
  },
  taskGroups: [
    {
      id: 'tg-1',
      title: 'Credentialing Uploads',
      description: 'The below list are all items that the credentialer is responsible for uploading and updating.',
      requirements: [
        {
          id: 'req-resume',
          title: 'Resume',
          description: 'Updated resume with no employment gaps exceeding 30 days.',
          status: 'missing',
          isRequired: true,
          type: 'upload'
        },
        {
          id: 'req-skills',
          title: 'Skills Checklist',
          description: 'Self-assessment of clinical skills relevant to RN Med/Surg.',
          status: 'missing',
          isRequired: true,
          type: 'upload'
        },
        {
          id: 'req-ref',
          title: 'References',
          description: 'Two professional references from recent clinical supervisors.',
          status: 'missing',
          isRequired: true,
          type: 'upload'
        }
      ]
    },
    {
      id: 'tg-2',
      title: 'Clinical Documents',
      requirements: [
        {
          id: 'req-rn',
          title: 'RN License',
          description: 'Active, unencumbered state license or compact license.',
          status: 'action_needed',
          isRequired: true,
          type: 'upload'
        },
        {
          id: 'req-tdap',
          title: 'TDAP',
          description: 'Must be within 10 years prior to start date.',
          status: 'completed',
          isRequired: true,
          type: 'upload'
        },
        {
          id: 'req-tb',
          title: 'TB Screening',
          description: 'Annual PPD or QuantiFERON Gold. If positive, provide clear Chest X-Ray.',
          status: 'reviewing',
          isRequired: true,
          type: 'upload'
        }
      ]
    },
    {
      id: 'tg-3',
      title: 'Access & Badge',
      requirements: [
        {
          id: 'req-badge-photo',
          title: 'Badge Photo',
          description: 'Professional headshot against a white background. No filters.',
          status: 'rejected',
          rejectionReason: 'The lighting was too dark and the face was obscured. Please retake the photo facing a window.',
          isRequired: true,
          type: 'upload'
        },
        {
          id: 'req-badge-form',
          title: 'Rightsourcing Authorization Release',
          description: 'We need your authorization to release the compliance packet to the facility.',
          status: 'completed',
          isRequired: true,
          type: 'esign'
        }
      ]
    },
    {
      id: 'tg-4',
      title: 'Background & Sanctions',
      requirements: [
        {
          id: 'req-ssn',
          title: 'Social Security Trace',
          description: 'Bundled background screen (ScoutLogic).',
          status: 'pending',
          isRequired: true,
          type: 'automated'
        },
        {
          id: 'req-state',
          title: 'Statewide Criminal Search',
          status: 'pending',
          isRequired: true,
          type: 'automated'
        },
        {
          id: 'req-drug',
          title: 'Submit Drug Screen Order',
          description: 'Drug test order to CastleBranch/Sterling. Instructions sent to email.',
          status: 'pending',
          isRequired: true,
          type: 'automated'
        }
      ]
    }
  ]
};
