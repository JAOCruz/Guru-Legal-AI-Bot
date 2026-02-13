# Claude Code Integration Prompt: Dominican Legal Services WhatsApp Bot

## Development Context

You are working with Jay, a creative technologist developing a WhatsApp bot for Dominican Republic legal services. The bot will use the Gemini API and handle document preparation, legal consultations, and service pricing for clients.

## Project Requirements

### Technical Stack

- **Language**: JavaScript/Node.js
- **LLM**: Google Gemini API (free tier)
- **Platform**: WhatsApp Business API
- **Location**: Dominican Republic
- **Pricing**: Services range from RD$ 150 - RD$ 2,000

### Core Functionality

1. **Legal service pricing inquiries**
2. **Document type identification and requirements**
3. **Process step-by-step guidance**
4. **Appointment scheduling integration**
5. **Document template generation**

## Legal Knowledge Base Integration

### Service Categories to Implement

```javascript
const serviceCategories = {
  contratos: {
    ventas: {
      /* pricing from config */
    },
    traslativos: {
      /* pricing from config */
    },
    rentas: {
      /* pricing from config */
    },
    acuerdos: {
      /* pricing from config */
    },
    poderes: {
      /* pricing from config */
    },
    declaraciones: {
      /* pricing from config */
    },
  },
  instancias: {
    standard: 150,
    medium: 200,
    complex: 300,
    highlevel: 500,
  },
  serviciosDigitales: {
    apostilla: "250-300",
    visaUS: 2000,
    inmueble: 500,
    gobierno: 500,
    pasaporte: 500,
    migracion: "600-800",
  },
};
```

### Response Template Structure

```javascript
const responseTemplate = {
  serviceInquiry: {
    price: "RD$ XXX",
    requirements: ["doc1", "doc2"],
    timeframe: "X días",
    legalBasis: "Ley XXX",
    nextSteps: ["step1", "step2"],
  },
};
```

## Implementation Guidelines

### Message Flow Design

1. **Greeting & Service Menu**
2. **Service Category Selection**
3. **Specific Service Inquiry**
4. **Requirements & Pricing Display**
5. **Appointment/Next Steps**

### Error Handling Requirements

- Handle incomplete requests gracefully
- Provide legal disclaimers appropriately
- Redirect complex cases to attorney consultation
- Maintain compliance focus

### Gemini API Integration

```javascript
const geminiConfig = {
  model: "gemini-1.5-flash",
  systemPrompt: `${legalServicesConfig}`, // From the MD file
  temperature: 0.3, // For consistent legal information
  maxTokens: 1000,
};
```

### WhatsApp-Specific Considerations

- Message length limits (4096 characters)
- Image/document attachment handling
- Button/list message formatting
- Business hours automation

## Code Structure Recommendations

### File Organization

```
src/
├── config/
│   ├── legal-services.js      // Pricing and service data
│   ├── gemini-config.js       // LLM configuration
│   └── whatsapp-config.js     // WhatsApp API settings
├── handlers/
│   ├── message-handler.js     // Main message processing
│   ├── service-handler.js     // Legal service logic
│   └── pricing-handler.js     // Pricing calculations
├── templates/
│   ├── responses.js           // Response templates
│   └── menus.js              // Menu structures
└── utils/
    ├── legal-validator.js     // Input validation
    └── compliance-checker.js  // Legal compliance checks
```

### Key Functions to Implement

```javascript
// Service identification and pricing
async function getServicePricing(serviceType, specificService)

// Document requirement listing
async function getDocumentRequirements(serviceType)

// Process step generation
async function getProcessSteps(serviceType)

// Legal compliance verification
function validateServiceRequest(userInput)

// Appointment scheduling integration
async function scheduleConsultation(userInfo, serviceType)
```

## Development Priorities

### Phase 1: Core Functionality

- [x] Basic service inquiry handling
- [x] Pricing information retrieval
- [x] Document requirement lists
- [ ] Simple appointment scheduling

### Phase 2: Enhanced Features

- [ ] Document template generation
- [ ] Multi-step form handling
- [ ] Payment integration planning
- [ ] Client data management

### Phase 3: Advanced Integration

- [ ] Government API connections
- [ ] Document status tracking
- [ ] Automated follow-ups
- [ ] Analytics and reporting

## Business Logic Implementation

### Pricing Calculation Logic

```javascript
function calculateTotalCost(serviceType, additionalServices = []) {
  let baseCost = getBasePricing(serviceType);
  let additionalCosts = additionalServices.map((service) =>
    getAdditionalServiceCost(service),
  );

  return {
    base: baseCost,
    additional: additionalCosts,
    total: baseCost + additionalCosts.reduce((a, b) => a + b, 0),
    taxes: calculateTaxes(serviceType),
    breakdown: generateCostBreakdown(baseCost, additionalCosts),
  };
}
```

### Compliance Checking

```javascript
function checkLegalCompliance(serviceRequest) {
  const requiredFields = getRequiredFields(serviceRequest.type);
  const missingFields = requiredFields.filter(
    (field) => !serviceRequest[field],
  );

  return {
    compliant: missingFields.length === 0,
    missingRequirements: missingFields,
    warnings: generateComplianceWarnings(serviceRequest),
    recommendations: getComplianceRecommendations(serviceRequest),
  };
}
```

## Testing Strategy

### Unit Tests Required

- Service pricing calculations
- Document requirement validation
- Legal compliance checking
- Message formatting

### Integration Tests

- Gemini API response handling
- WhatsApp message flow
- Database operations
- Error handling scenarios

### User Acceptance Testing

- Dominican Spanish language accuracy
- Legal terminology correctness
- User experience flow
- Performance under load

## Deployment Considerations

### Environment Variables

```javascript
const config = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN,
  DATABASE_URL: process.env.DATABASE_URL,
  LEGAL_DISCLAIMER: process.env.LEGAL_DISCLAIMER,
};
```

### Security Requirements

- API key protection
- User data encryption
- Compliance logging
- Rate limiting implementation

## Documentation Requirements

### Code Documentation

- Legal service mapping
- Pricing structure explanations
- API integration guides
- Deployment instructions

### User Documentation

- Service menu explanations
- Pricing transparency
- Legal disclaimers
- Contact information for complex cases

## Success Metrics

### Technical Metrics

- Response time < 2 seconds
- 99% uptime
- Error rate < 1%
- User completion rate > 80%

### Business Metrics

- Service inquiries per day
- Conversion to appointments
- Customer satisfaction scores
- Revenue per service type
