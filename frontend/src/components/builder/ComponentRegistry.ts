import { Layout, Grid, AlertOctagon, HelpCircle, Image } from 'lucide-react';

export interface ComponentDefinition {
  type: string;
  name: string;
  icon: any;
  defaultSettings: any;
  fields: {
    content: { [key: string]: { type: string; label: string; placeholder?: string; options?: string[]; fields?: any } };
    style: { [key: string]: { type: string; label: string; options?: string[]; min?: number; max?: number } };
  };
}

export const ComponentRegistry: { [key: string]: ComponentDefinition } = {
  hero: {
    type: 'hero',
    name: 'Hero Banner',
    icon: Layout,
    defaultSettings: {
      title: 'Protecting Vietnamese Family Clans',
      subtitle: 'AI Health Assistant',
      description: 'Your premier digital companion safeguarding families through instant health screening, history tracking, and medical guidance.',
      buttonText: 'Start Consultation Now',
      buttonUrl: '#',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      paddingTop: 80,
      paddingBottom: 80,
      textAlign: 'left',
    },
    fields: {
      content: {
        title: { type: 'text', label: 'Title Title' },
        subtitle: { type: 'text', label: 'Subtitle Subtitle' },
        description: { type: 'textarea', label: 'Body Description' },
        buttonText: { type: 'text', label: 'Action Button Label' },
        buttonUrl: { type: 'text', label: 'Action Button URL' },
        image: { type: 'text', label: 'Media Image URL' },
      },
      style: {
        backgroundColor: { type: 'color', label: 'Background Color' },
        textColor: { type: 'color', label: 'Text Color' },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
        textAlign: { type: 'select', label: 'Text Align', options: ['left', 'center', 'right'] },
      },
    },
  },
  features: {
    type: 'features',
    name: 'Features Grid',
    icon: Grid,
    defaultSettings: {
      title: 'Our Health Alliance Capabilities',
      columns: 3,
      items: [
        { title: 'AI Symptom Checker', description: 'Screen symptoms instantly with deep learning algorithms.', icon: 'Brain' },
        { title: 'Clan Genealogy Maps', description: 'Track hereditary conditions throughout ancestral lines.', icon: 'GitMerge' },
        { title: '24/7 Virtual Support', description: 'Reach qualified clinic guidance lines in seconds.', icon: 'Clock' },
      ],
      backgroundColor: '#09090b',
      textColor: '#fafafa',
      paddingTop: 60,
      paddingBottom: 60,
    },
    fields: {
      content: {
        title: { type: 'text', label: 'Section Header Title' },
        // List items handled through customized controls
      },
      style: {
        backgroundColor: { type: 'color', label: 'Background Color' },
        textColor: { type: 'color', label: 'Text Color' },
        columns: { type: 'select', label: 'Display Columns', options: ['2', '3', '4'] },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
      },
    },
  },
  cta: {
    type: 'cta',
    name: 'Call to Action',
    icon: AlertOctagon,
    defaultSettings: {
      title: 'Empower Your Family Health Alliance',
      description: 'Create an account in 30 seconds to connect family members, share digital medical records, and query AI clinical guidelines.',
      buttonText: 'Join Platform Free',
      buttonUrl: '#',
      backgroundColor: '#1e1b4b',
      textColor: '#ffffff',
      paddingTop: 80,
      paddingBottom: 80,
      textAlign: 'center',
    },
    fields: {
      content: {
        title: { type: 'text', label: 'Banner Title' },
        description: { type: 'textarea', label: 'Promo Description' },
        buttonText: { type: 'text', label: 'Button Label' },
        buttonUrl: { type: 'text', label: 'Button URL' },
      },
      style: {
        backgroundColor: { type: 'color', label: 'Background Color' },
        textColor: { type: 'color', label: 'Text Color' },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
        textAlign: { type: 'select', label: 'Text Align', options: ['left', 'center', 'right'] },
      },
    },
  },
  faq: {
    type: 'faq',
    name: 'FAQ Accordion',
    icon: HelpCircle,
    defaultSettings: {
      title: 'Frequently Answered Questions',
      items: [
        { question: 'Is my family genetic data shared with third parties?', answer: 'Absolutely not. All information is secured using AES-256 databases and complies fully with local healthcare confidentiality laws.' },
        { question: 'How accurate is the AI Health Assistant guidelines?', answer: 'The engine offers standard primary screening guidelines vetted by clinical databases, but does not substitute face-to-face physician diagnosis.' },
      ],
      backgroundColor: '#09090b',
      textColor: '#fafafa',
      paddingTop: 60,
      paddingBottom: 60,
    },
    fields: {
      content: {
        title: { type: 'text', label: 'FAQ Header Title' },
      },
      style: {
        backgroundColor: { type: 'color', label: 'Background Color' },
        textColor: { type: 'color', label: 'Text Color' },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
      },
    },
  },
  gallery: {
    type: 'gallery',
    name: 'Media Gallery',
    icon: Image,
    defaultSettings: {
      title: 'Explore Our Clinical Affiliates',
      columns: 3,
      items: [
        { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400', caption: 'State of the art consultation centers' },
        { url: 'https://images.unsplash.com/photo-1504813184591-01552a31c65f?auto=format&fit=crop&q=80&w=400', caption: 'Vetted partner clinical labs' },
        { url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=400', caption: '24/7 dedicated support alliance desks' },
      ],
      backgroundColor: '#09090b',
      textColor: '#fafafa',
      paddingTop: 60,
      paddingBottom: 60,
    },
    fields: {
      content: {
        title: { type: 'text', label: 'Gallery Header Title' },
      },
      style: {
        backgroundColor: { type: 'color', label: 'Background Color' },
        textColor: { type: 'color', label: 'Text Color' },
        columns: { type: 'select', label: 'Grid Columns', options: ['2', '3', '4'] },
        paddingTop: { type: 'number', label: 'Padding Top (px)', min: 0, max: 200 },
        paddingBottom: { type: 'number', label: 'Padding Bottom (px)', min: 0, max: 200 },
      },
    },
  },
};
