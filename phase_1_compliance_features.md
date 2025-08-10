# Phase 1 Compliance & Reporting Features

## Essential Compliance Tools for MVP

These compliance features are critical for hospitality businesses to meet New Zealand food safety requirements and provide audit-ready documentation from day one.

---

## 1. Health Inspector Portal

### Read-Only Inspector Access
```typescript
interface InspectorPortal {
  accessType: 'read-only';
  accessLevel: 'compliance-data-only';
  timeframe: 'configurable'; // 30, 60, 90 days or custom
  authentication: 'secure-token-based';
}

// Inspector access workflow
async function grantInspectorAccess(clientId: string, inspectorDetails: InspectorInfo) {
  // Generate secure, time-limited access token
  const accessToken = await createInspectorToken({
    client_id: clientId,
    inspector_name: inspectorDetails.name,
    inspector_id: inspectorDetails.officialId,
    access_granted_by: currentUser.id,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    permissions: ['view_delivery_records', 'view_compliance_reports', 'export_audit_data']
  });
  
  // Send secure access link
  await sendInspectorAccessEmail(inspectorDetails.email, accessToken);
  
  // Log access grant for audit
  await logInspectorAccess({
    client_id: clientId,
    inspector_id: inspectorDetails.officialId,
    granted_by: currentUser.id,
    granted_at: new Date(),
    access_type: 'portal_access'
  });
}

interface InspectorInfo {
  name: string;
  officialId: string; // Government inspector ID
  email: string;
  department: string; // e.g., "Auckland Council Food Safety"
  requestDate: string;
}
```

### Inspector Dashboard Features
```typescript
const INSPECTOR_DASHBOARD_FEATURES = {
  complianceOverview: {
    totalDeliveries: 'last_30_days',
    complianceRate: 'percentage_compliant',
    violationCount: 'number_of_violations',
    criticalIssues: 'temperature_failures'
  },
  deliveryRecords: {
    searchable: true,
    filterable: ['date_range', 'supplier', 'product_type', 'compliance_status'],
    sortable: ['date', 'supplier', 'temperature', 'compliance_status'],
    exportable: ['pdf', 'csv']
  },
  temperatureTracking: {
    violationAlerts: 'highlighted',
    trendAnalysis: 'basic_charts',
    supplierPerformance: 'compliance_by_supplier'
  },
  auditTrail: {
    userActivity: 'who_uploaded_what_when',
    systemLogs: 'processing_timestamps',
    dataIntegrity: 'verification_checksums'
  }
};
```

---

## 2. Automated Compliance Reports

### Report Generation System
```typescript
interface ComplianceReport {
  reportType: 'weekly' | 'monthly' | 'custom' | 'inspection_ready';
  period: { startDate: string; endDate: string };
  includePhotos: boolean;
  format: 'pdf' | 'csv' | 'both';
  recipients: string[]; // Email addresses
  schedule?: 'manual' | 'weekly_monday' | 'monthly_1st';
}

async function generateComplianceReport(clientId: string, reportConfig: ComplianceReport) {
  // Gather compliance data
  const reportData = await compileReportData(clientId, reportConfig.period);
  
  // Generate PDF report
  if (reportConfig.format === 'pdf' || reportConfig.format === 'both') {
    const pdfReport = await generatePDFReport(reportData, reportConfig);
    await storeReport(clientId, pdfReport, 'pdf');
  }
  
  // Generate CSV export
  if (reportConfig.format === 'csv' || reportConfig.format === 'both') {
    const csvReport = await generateCSVReport(reportData);
    await storeReport(clientId, csvReport, 'csv');
  }
  
  // Email to recipients
  await emailReport(reportConfig.recipients, reportData, reportConfig.format);
  
  // Log report generation
  await logReportGeneration(clientId, reportConfig);
}

async function compileReportData(clientId: string, period: { startDate: string; endDate: string }) {
  const deliveryRecords = await supabase
    .from('delivery_records')
    .select(`
      *,
      temperature_readings (*),
      suppliers (name, contact_email)
    `)
    .eq('client_id', clientId)
    .gte('delivery_date', period.startDate)
    .lte('delivery_date', period.endDate)
    .order('delivery_date', { ascending: false });
    
  const complianceStats = await calculateComplianceMetrics(deliveryRecords.data);
  const violationSummary = await generateViolationSummary(deliveryRecords.data);
  const supplierPerformance = await analyzeSupplierPerformance(deliveryRecords.data);
  
  return {
    period,
    totalDeliveries: deliveryRecords.data?.length || 0,
    complianceStats,
    violationSummary,
    supplierPerformance,
    deliveryDetails: deliveryRecords.data,
    generatedAt: new Date().toISOString()
  };
}
```

### PDF Report Template
```typescript
async function generatePDFReport(reportData: any, config: ComplianceReport) {
  const pdfContent = {
    header: {
      title: 'Food Safety Compliance Report',
      business: reportData.businessName,
      period: `${reportData.period.startDate} to ${reportData.period.endDate}`,
      generatedDate: new Date().toLocaleDateString('en-NZ'),
      reportNumber: generateReportNumber()
    },
    
    executiveSummary: {
      totalDeliveries: reportData.totalDeliveries,
      complianceRate: `${reportData.complianceStats.overallCompliance}%`,
      criticalViolations: reportData.violationSummary.critical,
      recommendedActions: generateRecommendations(reportData)
    },
    
    complianceMetrics: {
      temperatureCompliance: {
        chilled: `${reportData.complianceStats.chilledCompliance}%`,
        frozen: `${reportData.complianceStats.frozenCompliance}%`,
        ambient: `${reportData.complianceStats.ambientCompliance}%`
      },
      supplierPerformance: reportData.supplierPerformance,
      trendAnalysis: generateTrendCharts(reportData)
    },
    
    violationDetails: reportData.violationSummary.details,
    
    deliveryLog: config.includePhotos 
      ? reportData.deliveryDetails.map(record => ({
          date: record.delivery_date,
          supplier: record.supplier_name,
          temperature: record.temperature_readings,
          photo: record.image_path,
          status: record.compliance_status
        }))
      : reportData.deliveryDetails.map(record => ({
          date: record.delivery_date,
          supplier: record.supplier_name,
          temperature: record.temperature_readings,
          status: record.compliance_status
        })),
        
    footer: {
      digitalSignature: generateDigitalSignature(reportData),
      auditTrail: 'This report was generated automatically from verified digital records',
      contact: 'For questions about this report, contact your compliance team'
    }
  };
  
  return await renderPDFFromTemplate(pdfContent);
}
```

---

## 3. Real-Time Violation Alerts

### Alert System Configuration
```typescript
interface AlertConfiguration {
  alertTypes: {
    critical: {
      temperature: {
        chilled_over_7c: true,
        frozen_over_minus_15c: true,
        ambient_over_30c: true
      },
      delivery: {
        no_temperature_recorded: true,
        unreadable_docket: true,
        missing_supplier_info: true
      }
    },
    warning: {
      temperature: {
        chilled_over_4c: true,
        frozen_over_minus_18c: true,
        ambient_over_25c: true
      },
      operational: {
        multiple_violations_today: true,
        supplier_pattern_issues: true
      }
    }
  },
  
  notificationMethods: {
    email: {
      enabled: true,
      recipients: ['manager@restaurant.co.nz', 'owner@restaurant.co.nz'],
      template: 'immediate_alert'
    },
    sms: {
      enabled: true,
      recipients: ['+64211234567'], // Manager's mobile
      criticalOnly: true
    },
    inApp: {
      enabled: true,
      pushNotification: true,
      showOnDashboard: true
    }
  },
  
  escalation: {
    noResponse: {
      timeLimit: 30, // minutes
      escalateTo: 'owner@restaurant.co.nz',
      method: 'email_and_sms'
    }
  }
}

async function processViolationAlert(deliveryRecord: any, violation: ViolationType) {
  const alertLevel = determineAlertLevel(violation);
  const client = await getClientSettings(deliveryRecord.client_id);
  
  // Create alert record
  const alert = await supabase
    .from('compliance_alerts')
    .insert({
      delivery_record_id: deliveryRecord.id,
      client_id: deliveryRecord.client_id,
      alert_type: violation.type,
      severity: alertLevel,
      temperature_value: violation.temperature,
      supplier_name: deliveryRecord.supplier_name,
      message: generateAlertMessage(violation),
      requires_acknowledgment: alertLevel === 'critical',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  // Send notifications based on severity
  if (alertLevel === 'critical') {
    await sendCriticalAlert(alert, client.alertConfiguration);
  } else {
    await sendWarningAlert(alert, client.alertConfiguration);
  }
  
  // Log for audit trail
  await logAlertSent(alert);
}
```

### Alert Templates
```typescript
const ALERT_TEMPLATES = {
  email: {
    critical: {
      subject: '🚨 CRITICAL: Food Safety Violation - {{supplier_name}}',
      body: `
        <h2 style="color: #dc2626;">Critical Food Safety Alert</h2>
        
        <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626;">
          <strong>Violation Details:</strong><br>
          • Supplier: {{supplier_name}}<br>
          • Temperature: {{temperature_value}}°C<br>
          • Safe Range: {{safe_range}}<br>
          • Delivery Time: {{delivery_time}}<br>
          • Docket Photo: <a href="{{photo_url}}">View Evidence</a>
        </div>
        
        <h3>Immediate Actions Required:</h3>
        <ol>
          <li>Quarantine affected products immediately</li>
          <li>Check product quality before use</li>
          <li>Contact supplier about delivery conditions</li>
          <li>Document corrective actions taken</li>
        </ol>
        
        <p><strong>This alert requires acknowledgment.</strong> 
        <a href="{{acknowledge_url}}">Click here to acknowledge</a></p>
      `
    },
    
    warning: {
      subject: '⚠️ Food Safety Warning - {{supplier_name}}',
      body: `
        <h2 style="color: #d97706;">Food Safety Warning</h2>
        
        <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #d97706;">
          <strong>Warning Details:</strong><br>
          • Supplier: {{supplier_name}}<br>
          • Temperature: {{temperature_value}}°C<br>
          • Recommended Range: {{safe_range}}<br>
          • Delivery Time: {{delivery_time}}
        </div>
        
        <h3>Recommended Actions:</h3>
        <ul>
          <li>Monitor this supplier more closely</li>
          <li>Verify product quality</li>
          <li>Consider discussing delivery procedures with supplier</li>
        </ul>
      `
    }
  },
  
  sms: {
    critical: 'CRITICAL ALERT: {{supplier_name}} delivery temp {{temperature_value}}°C exceeds safe limit. Check products immediately. View details: {{short_url}}',
    warning: 'WARNING: {{supplier_name}} delivery temp {{temperature_value}}°C above recommended. Please review. Details: {{short_url}}'
  }
};
```

---

## 4. Audit Trail & Export System

### Comprehensive Audit Logging
```typescript
interface AuditLogEntry {
  timestamp: string;
  userId: string;
  clientId: string;
  action: string;
  resourceType: 'delivery_record' | 'user' | 'settings' | 'report' | 'alert';
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

async function createAuditLog(entry: Omit<AuditLogEntry, 'timestamp'>) {
  await supabase
    .from('audit_logs')
    .insert({
      ...entry,
      timestamp: new Date().toISOString()
    });
}

// Audit key actions
const AUDITED_ACTIONS = {
  'document.uploaded': 'User uploaded delivery docket',
  'document.processed': 'System processed document with AI',
  'violation.detected': 'System detected compliance violation',
  'alert.sent': 'System sent violation alert',
  'report.generated': 'Compliance report generated',
  'inspector.access_granted': 'Inspector portal access granted',
  'user.login': 'User logged into system',
  'settings.modified': 'User modified compliance settings',
  'data.exported': 'User exported compliance data'
};
```

### Data Export System
```typescript
interface ExportRequest {
  clientId: string;
  exportType: 'full_audit' | 'delivery_records' | 'compliance_summary' | 'violation_log';
  dateRange: { startDate: string; endDate: string };
  format: 'csv' | 'pdf' | 'json';
  includePhotos: boolean;
  requestedBy: string;
  purpose: 'inspection' | 'audit' | 'backup' | 'analysis';
}

async function generateAuditExport(request: ExportRequest) {
  // Create export record for tracking
  const exportRecord = await supabase
    .from('data_exports')
    .insert({
      client_id: request.clientId,
      export_type: request.exportType,
      requested_by: request.requestedBy,
      purpose: request.purpose,
      status: 'processing',
      requested_at: new Date().toISOString()
    })
    .select()
    .single();
    
  try {
    // Compile data based on export type
    const exportData = await compileExportData(request);
    
    // Generate file in requested format
    const exportFile = await generateExportFile(exportData, request.format);
    
    // Store securely with time-limited access
    const downloadUrl = await storeExportFile(exportFile, exportRecord.id);
    
    // Update export record
    await supabase
      .from('data_exports')
      .update({
        status: 'completed',
        download_url: downloadUrl,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        completed_at: new Date().toISOString()
      })
      .eq('id', exportRecord.id);
      
    // Send download link
    await sendExportReadyEmail(request.requestedBy, downloadUrl, request.exportType);
    
    // Audit the export
    await createAuditLog({
      userId: request.requestedBy,
      clientId: request.clientId,
      action: 'data.exported',
      resourceType: 'delivery_record',
      details: {
        exportType: request.exportType,
        dateRange: request.dateRange,
        format: request.format,
        purpose: request.purpose
      },
      ipAddress: '', // Would be captured from request
      userAgent: '',
      sessionId: ''
    });
    
  } catch (error) {
    // Handle export failure
    await supabase
      .from('data_exports')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', exportRecord.id);
      
    throw error;
  }
}
```

### Inspector-Ready Export Format
```typescript
const INSPECTOR_EXPORT_TEMPLATE = {
  coverPage: {
    businessName: '{{client.name}}',
    licenseNumber: '{{client.license_number}}',
    reportPeriod: '{{export.date_range}}',
    generatedDate: '{{current_date}}',
    certificationStatement: 'This export contains digitally verified compliance records'
  },
  
  summary: {
    totalDeliveries: '{{stats.total_deliveries}}',
    complianceRate: '{{stats.compliance_percentage}}%',
    violationCount: '{{stats.total_violations}}',
    criticalIssues: '{{stats.critical_violations}}'
  },
  
  deliveryLog: {
    columns: [
      'Date/Time',
      'Supplier',
      'Product Type',
      'Temperature Recorded',
      'Safe Range',
      'Compliance Status',
      'Photo Reference',
      'Staff Member'
    ],
    verificationNote: 'All temperatures extracted using certified AI document processing'
  },
  
  violationDetails: {
    eachViolation: {
      timestamp: '{{violation.timestamp}}',
      description: '{{violation.description}}',
      correctiveAction: '{{violation.corrective_action}}',
      preventiveMeasures: '{{violation.preventive_measures}}'
    }
  },
  
  digitalSignature: {
    checksum: '{{data.checksum}}',
    generationTimestamp: '{{export.created_at}}',
    verificationStatement: 'This document contains tamper-evident digital signatures'
  }
};
```

---

## 5. Compliance Dashboard & Monitoring

### Real-Time Compliance Dashboard
```typescript
interface ComplianceDashboard {
  todaysMetrics: {
    deliveriesProcessed: number;
    complianceRate: number;
    activeViolations: number;
    pendingAlerts: number;
  };
  
  weeklyTrends: {
    complianceByDay: Array<{ date: string; rate: number }>;
    violationsByType: Array<{ type: string; count: number }>;
    supplierPerformance: Array<{ supplier: string; score: number }>;
  };
  
  alerts: {
    critical: Array<AlertItem>;
    warnings: Array<AlertItem>;
    acknowledged: Array<AlertItem>;
  };
  
  upcomingTasks: {
    pendingAcknowledgments: number;
    scheduledReports: Array<{ type: string; dueDate: string }>;
    inspectorAccessRequests: Array<{ inspector: string; requestDate: string }>;
  };
}

async function getDashboardData(clientId: string): Promise<ComplianceDashboard> {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Today's metrics
  const todaysDeliveries = await getTodaysDeliveries(clientId, today);
  const todaysCompliance = calculateComplianceRate(todaysDeliveries);
  
  // Weekly trends
  const weeklyData = await getWeeklyTrends(clientId, weekAgo);
  
  // Active alerts
  const alerts = await getActiveAlerts(clientId);
  
  // Upcoming tasks
  const tasks = await getUpcomingTasks(clientId);
  
  return {
    todaysMetrics: {
      deliveriesProcessed: todaysDeliveries.length,
      complianceRate: todaysCompliance,
      activeViolations: alerts.critical.length,
      pendingAlerts: alerts.critical.filter(a => !a.acknowledged).length
    },
    weeklyTrends: weeklyData,
    alerts,
    upcomingTasks: tasks
  };
}
```

---

## Implementation Notes

### New Zealand Compliance Requirements
- **Food Act 2014** - Temperature logging requirements
- **MPI Guidelines** - Ministry for Primary Industries standards
- **Local Council** - Regional health department access
- **Records Retention** - Minimum 2 years for food safety records

### Security & Privacy
- **Inspector access** is time-limited and audited
- **Data exports** expire after 7 days
- **All compliance actions** are logged for audit
- **Digital signatures** ensure data integrity

### Integration Points
- **Connects with existing auth system** for user verification
- **Uses Document AI results** for violation detection
- **Triggers Stripe usage tracking** when reports generated
- **Sends notifications** via existing email/SMS system

---

These compliance features ensure your platform meets all regulatory requirements while providing the audit trail and reporting capabilities that hospitality businesses need for health inspections and ongoing compliance management.