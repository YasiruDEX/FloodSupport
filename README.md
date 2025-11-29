# FloodSupport Sri Lanka - Analytics Dashboard

A real-time analytics dashboard for visualizing and monitoring flood relief SOS data across Sri Lanka. This platform provides district-wise insights, emergency type breakdowns, and priority-based filtering to support disaster relief coordination efforts.

**Live Dashboard:** [https://stats.floodsupport.org](https://stats.floodsupport.org)

---

## Overview

FloodSupport Analytics Dashboard is designed to help relief coordinators, government agencies, and volunteers track and respond to flood emergencies across Sri Lanka. The dashboard aggregates SOS requests from the FloodSupport platform and presents actionable insights through interactive visualizations.

---

## Features

### Real-Time Data Visualization
- **Status by District**: Stacked bar charts showing pending, verified, rescued, and completed cases
- **Priority Distribution**: Visual breakdown of critical, high, medium, and low priority requests
- **Emergency Types**: Pie charts and bar graphs for trapped, food/water, medical, and rescue assistance cases
- **Vulnerable Groups**: Analysis of cases involving children, elderly, disabled individuals, and medical emergencies
- **District Impact Clusters**: Bubble chart comparing districts against emergency types with bubble size representing affected population

### Interactive Features
- Global filters for district, status, priority, and emergency type
- Per-chart filtering and customization options
- Sortable data tables with district-wise summaries
- Individual record viewing with detailed information
- CSV export functionality for offline analysis
- Auto-refresh capability for real-time updates

### Responsive Design
- Optimized for desktop, tablet, and mobile devices
- Collapsed filters on mobile for better usability
- Adaptive chart sizing and table layouts

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Data Source

The dashboard consumes data from the FloodSupport API:

```
GET https://floodsupport.org/api/sos
```

### Data Points Tracked
- SOS request status (Pending, Verified, Rescued, Completed, Cannot Contact)
- Priority levels (Critical, High, Medium, Low)
- Emergency types (Trapped, Food/Water, Medical, Rescue Assistance, Missing Person)
- District-wise distribution
- Number of people affected
- Vulnerable population indicators
- Resource availability (Food, Water, Power)

---

## Dashboard Sections

### Statistics Cards
Quick overview metrics including:
- Total Cases
- People Affected
- Critical Priority
- Pending Requests
- Verified Cases
- Rescued Count
- Missing Persons
- Cannot Contact

### Charts View
- Status by District (Stacked Bar)
- Priority by District (Grouped Bar)
- Emergency Types Distribution (Pie)
- Priority Distribution (Pie)
- People Affected by District (Bar)
- Vulnerable Groups Analysis (Horizontal Bar)
- District Impact Clusters (Bubble Chart)

### Data Tables
- District-wise Summary Table
- Emergency Types by District Table

### Records View
- Searchable and filterable list of individual SOS requests
- Detailed record modal with complete information

---

## Project Structure

```
FloodSupport/
├── flood-dashboard/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main dashboard page
│   │   │   ├── layout.tsx        # Root layout
│   │   │   └── api/              # API routes
│   │   ├── components/
│   │   │   ├── Charts.tsx        # Chart components
│   │   │   └── Dashboard.tsx     # Dashboard components
│   │   └── types/
│   │       └── index.ts          # TypeScript interfaces
│   ├── public/
│   │   └── favicon.ico
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── flood_report_generator.py     # Python script for Excel reports
└── README.md
```

---

## API Response Structure

```typescript
interface APIResponse {
  success: boolean;
  data: SOSRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalPeople: number;
    missingPeopleCount: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
}
```

---

## Contributing

Contributions are welcome and appreciated. Whether it is bug fixes, feature additions, documentation improvements, or UI enhancements, all contributions help improve disaster relief coordination.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add: description of changes'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

### Areas for Contribution
- Additional chart types and visualizations
- Performance optimizations
- Accessibility improvements
- Localization (Sinhala, Tamil language support)
- Mobile experience enhancements
- Data export formats (PDF, JSON)
- Real-time notifications
- Map-based visualizations

---

## Related Projects

- [FloodSupport Main Platform](https://floodsupport.org) - Primary SOS submission and coordination platform
- [FloodSupport SOS Dashboard](https://floodsupport.org/sos/dashboard) - Operational dashboard for rescue teams

---

## License

This project is developed for humanitarian purposes to support flood relief efforts in Sri Lanka.

---

## Acknowledgments

- All volunteers and contributors supporting flood relief efforts
- FloodSupport.org team for providing the API and platform
- Open source community for the tools and libraries used

---

## Contact

For questions, suggestions, or collaboration inquiries related to this dashboard, please open an issue on this repository.

---

<p align="center">
  <strong>Built with purpose. Deployed for impact.</strong>
</p>

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Recharts](https://img.shields.io/badge/Recharts-3.5-FF6384?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/Purpose-Humanitarian-green?style=flat-square)
