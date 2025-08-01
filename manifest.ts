import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name : 'Blood Donation App',
    short_name: 'Blood Donation',
    description: 'A platform to manage blood donations and schedules',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff0000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/Logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    screenshots : [
        {
            src: '/pic1.png',
            sizes: '1920x948',
            type: 'image/png',
            label: 'Health Bot'
        },
        {
            src: '/pic2.png',
            sizes: '1920x948',
            type: 'image/png',
            label: 'Home Screen'
        },
        {
            src: '/pic3.png',
            sizes: '1920x948',
            type: 'image/png',
            label: 'Find Blood Donors'
        },
        {
            src: '/pic4.png',
            sizes: '1920x948',
            type: 'image/png',
            label: 'Donation Impact'
        },
        {
            src: '/pic5.png',
            sizes: '1920x948',
            type: 'image/png',
            label: 'Dashboard'
        },
        ],
  };
}
