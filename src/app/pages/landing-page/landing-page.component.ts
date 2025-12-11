import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Feature {
  id: number;
  icon: string;     
  title: string;
  description: string;
}

interface Plan {
  id: number;
  title: string;
  price: number;
  period: string;
  subtitle: string;
  features: string[];
  popular?: boolean;
}

interface LoyaltyCard {
  id: number;
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  features: Feature[] = [
    {
      id: 1,
      icon: 'ri-bank-card-line',
      title: 'Digital Loyalty Cards',
      description:
        'Create beautiful digital loyalty cards that customers can access instantly on their phones. No more lost cards or forgotten punches.'
    },
    {
      id: 2,
      icon: 'ri-coin-line',
      title: 'Points & Rewards System',
      description:
        'Flexible points system with customizable rewards. Set up tiered programs, bonus points, and special promotions effortlessly.'
    },
    {
      id: 3,
      icon: 'ri-dashboard-line',
      title: 'Analytics Dashboard',
      description:
        'Track customer behavior, program performance, and ROI with detailed analytics. Make data-driven decisions to optimize your program.'
    },
    {
      id: 4,
      icon: 'ri-smartphone-line',
      title: 'Mobile-First Design',
      description:
        'Optimized for mobile devices with a seamless customer experience. QR code scanning and instant notifications included.'
    },
    {
      id: 5,
      icon: 'ri-mail-line',
      title: 'Customer Engagement',
      description:
        'Automated email and SMS campaigns to keep customers engaged. Send personalized offers and birthday rewards automatically.'
    },
    {
      id: 6,
      icon: 'ri-settings-3-line',
      title: 'Easy Integration',
      description:
        'Integrate with your existing POS system, website, or app. API access and pre-built integrations for popular platforms.'
    }
  ];

  plans: Plan[] = [
    {
      id: 1,
      title: 'Starter',
      price: 29,
      period: '/Month',
      subtitle: 'Perfect for small business',
      features: [
        'Up to 500 customers',
        'Digital loyalty cards',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      id: 2,
      title: 'Professional',
      price: 79,
      period: '/Month',
      subtitle: 'Great for growing businesses',
      popular: true,
      features: [
        'Up to 2,500 customers',
        'Advanced analytics',
        'SMS & Email campaigns',
        'API access',
        'Priority support'
      ]
    },
    {
      id: 3,
      title: 'Enterprise',
      price: 199,
      period: '/Month',
      subtitle: 'For Large Business',
      features: [
        'Unlimited customers',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager',
        '24/7 phone support'
      ]
    }
  ];

  loyaltyCards: LoyaltyCard[] = [
    {
      id: 1,
      image: 'images/room-image.jpg',
      title: 'Coffee Shop Loyalty Card',
      description:
        'Our Coffee Shop Rewards Card lets you earn points on every purchase and enjoy exclusive discounts, free drinks, and special member perks.'
    },
    {
      id: 2,
      image: 'images/table-image.jpg',
      title: 'Restaurant Loyalty Card',
      description:
        'Join our loyalty program and earn points with every visit. Redeem them for discounts, free dishes, and member-only perks.'
    },
    {
      id: 3,
      image: 'images/hair_salon.jpg',
      title: 'Hair Salon Loyalty Card',
      description:
        'Our Hair Salon Loyalty Card rewards you for every visit. Collect points and redeem them for exclusive beauty perks and savings.'
    }
  ];

 trackByFeatureId = (_: number, feature: Feature) => feature.id;
trackByPlanId = (_: number, plan: Plan) => plan.id;
trackByCardId = (_: number, card: LoyaltyCard) => card.id;

}
