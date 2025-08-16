# Google Cloud AI Setup Guide

Complete setup instructions for Google Cloud Document AI integration with the Hospitality Compliance SaaS platform.

## Prerequisites

- Google Cloud Platform account with billing enabled
- Project with Document AI API enabled
- Service account with appropriate permissions
- Supabase project configured

## Step 1: Enable Document AI API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Library**
3. Search for "Document AI API"
4. Click **Enable** on the Document AI API

## Step 2: Create Document AI Processor

1. Go to **Document AI > Processors**
2. Click **Create Processor**
3. Select **Form Parser** processor type
4. Choose your region (recommended: `us` or `eu`)
5. Click **Create**
6. Note the **Processor ID** (format: `projects/PROJECT_ID/locations/LOCATION/processors/PROCESSOR_ID`)

## Step 3: Create Service Account

1. Go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Enter service account details:
   - **Name**: `hospitality-compliance-ai`
   - **Description**: `Service account for Document AI processing`
4. Click **Create and Continue**

## Step 4: Assign Permissions

Assign the following roles to the service account:

- **Document AI API User** (`roles/documentai.apiUser`)
- **Storage Object Viewer** (`roles/storage.objectViewer`) (if using Cloud Storage)
- **Logging Writer** (`roles/logging.logWriter`) (for debugging)

## Step 5: Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key > Create new key**
4. Select **JSON** format
5. Download the key file (keep it secure!)

## Step 6: Environment Configuration

Add the following environment variables to your Supabase project:

### In Supabase Dashboard (Settings > Edge Functions > Environment Variables):

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token"}

# Document AI Processor
DOCUMENT_AI_PROCESSOR_ID=projects/your-project/locations/us/processors/your-processor-id

# Google Cloud Project
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### Local Development (.env.local):

```bash
# Copy the same variables for local testing
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}
DOCUMENT_AI_PROCESSOR_ID=projects/your-project/locations/us/processors/your-processor-id
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## Step 7: Database Migration

Deploy the enhanced extraction database schema:

1. Open Supabase SQL Editor
2. Copy and paste the contents of `ENHANCED_EXTRACTION_MIGRATION.sql`
3. Execute the migration
4. Verify successful completion in the output

### Expected Migration Output:
```sql
Enhanced Extraction Migration Results:
   Enhanced columns added: 7 of 7
   Performance indexes created: 5
   Analytics table created: ✅

🎉 Enhanced Google Cloud AI extraction migration completed successfully!
📈 Ready for advanced document processing with product classification and compliance analysis
```

## Step 8: Test Configuration

Test your setup using the test endpoint:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/process-delivery-docket \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "bucketId": "test-bucket",
    "fileName": "test-document.jpg",
    "filePath": "test/path",
    "userId": "test-user",
    "clientId": "test-client"
  }'
```

## Troubleshooting

### Common Issues

#### 1. "Permission denied" errors
- Verify service account has `documentai.apiUser` role
- Check that the processor ID is correct
- Ensure the service account key is properly formatted in environment variables

#### 2. "Processor not found" errors
- Verify the processor ID format: `projects/PROJECT_ID/locations/LOCATION/processors/PROCESSOR_ID`
- Ensure the processor is in the same project as your service account
- Check that the processor region matches your configuration

#### 3. "Quota exceeded" errors
- Review your [Document AI quotas](https://cloud.google.com/document-ai/quotas)
- Consider implementing request throttling
- Upgrade to higher quota limits if needed

#### 4. JSON parsing errors in environment variables
- Escape quotes properly in the credentials JSON
- Use online JSON validators to verify format
- Consider using base64 encoding for complex JSON

### Testing Commands

```bash
# Test Google Cloud authentication
gcloud auth application-default print-access-token

# Test Document AI processor
gcloud ai document-ai processors list --location=us

# Validate service account key
gcloud auth activate-service-account --key-file=path/to/key.json
```

## Performance Optimization

### Request Limits
- Document AI: 600 requests per minute per processor
- Implement queue system for high-volume processing
- Use batch processing for multiple documents

### Cost Optimization
- Monitor usage in Google Cloud Console > Document AI > Usage
- Set up billing alerts for unexpected usage
- Consider caching results for repeated documents

### Error Handling
- The system includes comprehensive fallback mechanisms
- Monitor error rates in Supabase logs
- Set up alerts for processing failures

## Security Best Practices

1. **Service Account Key Security**
   - Never commit service account keys to version control
   - Use environment variables or secret management systems
   - Rotate keys regularly (every 90 days recommended)

2. **Access Controls**
   - Limit service account permissions to minimum required
   - Use IAM conditions for additional security
   - Monitor service account usage in Cloud Logging

3. **Network Security**
   - Use VPC Service Controls if processing sensitive data
   - Consider private Google access for enhanced security
   - Implement IP allowlisting if required

## Monitoring and Logging

### Google Cloud Monitoring
1. Enable Cloud Logging for Document AI
2. Set up custom metrics for processing success/failure rates
3. Create alerts for quota approaching limits

### Supabase Monitoring
1. Monitor edge function execution in Supabase dashboard
2. Track processing times and error rates
3. Set up log forwarding for centralized monitoring

## Support and Resources

- [Google Cloud Document AI Documentation](https://cloud.google.com/document-ai/docs)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Project Repository Issues](https://github.com/your-repo/issues)

## Migration Checklist

- [ ] Google Cloud project created with billing enabled
- [ ] Document AI API enabled
- [ ] Document AI processor created and configured
- [ ] Service account created with appropriate permissions
- [ ] Service account key generated and secured
- [ ] Environment variables configured in Supabase
- [ ] Database migration deployed successfully
- [ ] Test document processed successfully
- [ ] Monitoring and alerting configured
- [ ] Security review completed

---

🎉 **Congratulations!** Your Google Cloud AI integration is now ready for production use.

The enhanced Document AI pipeline provides:
- ✅ 6-stage processing with fallback mechanisms
- ✅ Product classification and temperature compliance analysis
- ✅ Comprehensive confidence scoring and validation
- ✅ Safari 12 compatibility with memory optimization
- ✅ Production-ready error handling and monitoring