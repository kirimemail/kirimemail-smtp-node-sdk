const {
  SmtpClient,
  CredentialsApi,
  DomainsApi,
  LogsApi,
  MessagesApi,
  SuppressionsApi,
  Credential,
  Domain,
  LogEntry,
  Suppression
} = require('../dist');

async function comprehensiveExample() {
  // Example configuration
  const username = 'your_username';
  const token = 'your_token';
  const domain = 'example.com';

  try {
    // Initialize the client with Basic Auth
    const client = new SmtpClient(username, token);

    // Initialize all API classes
    const credentialsApi = new CredentialsApi(client);
    const domainsApi = new DomainsApi(client);
    const logsApi = new LogsApi(client);
    const messagesApi = new MessagesApi(client);
    const suppressionsApi = new SuppressionsApi(client);

    console.log('=== KirimEmail SMTP Node.js SDK Comprehensive Example ===\n');

    // === DOMAINS API EXAMPLES ===
    console.log('1. DOMAINS API EXAMPLES');
    console.log('-----------------------');

    // List domains
    try {
      const domains = await domainsApi.listDomains({ limit: 5 });
      console.log(`✓ Listed ${domains.data.length} domains`);

      if (domains.data.length > 0) {
        const firstDomain = domains.data[0];
        console.log(`  First domain: ${firstDomain.domain}`);
        console.log(`  Verified: ${firstDomain.isVerified ? 'Yes' : 'No'}`);
        console.log(`  Active: ${firstDomain.isActive() ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`✗ Failed to list domains: ${error.message}`);
    }

    console.log('\n');

    // === CREDENTIALS API EXAMPLES ===
    console.log('2. CREDENTIALS API EXAMPLES');
    console.log('--------------------------');

    // List credentials
    try {
      const credentials = await credentialsApi.listCredentials(domain, { limit: 5 });
      console.log(`✓ Listed ${credentials.data.length} credentials`);

      if (credentials.data.length > 0) {
        const firstCredential = credentials.data[0];
        console.log(`  First credential: ${firstCredential.username}`);
        console.log(`  Verified: ${firstCredential.isVerified ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`✗ Failed to list credentials: ${error.message}`);
    }

    console.log('\n');

    // === MESSAGES API EXAMPLES ===
    console.log('3. MESSAGES API EXAMPLES');
    console.log('------------------------');

    // Send a simple email
    try {
      const emailData = {
        from: `sender@${domain}`,
        to: 'recipient@example.com',
        subject: 'Test Email from Node.js SDK',
        text: 'Hello!\n\nThis is a test email sent using the KirimEmail Node.js SDK.'
      };

      const result = await messagesApi.sendMessage(domain, emailData);
      console.log(`✓ Sent email: ${result.success ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.log(`✗ Failed to send email: ${error.message}`);
    }

    console.log('\n');

    // === LOGS API EXAMPLES ===
    console.log('4. LOGS API EXAMPLES');
    console.log('---------------------');

    // Get recent logs
    try {
      const logs = await logsApi.getLogs(domain, { limit: 10 });
      console.log(`✓ Retrieved ${logs.data.length} log entries`);

      if (logs.data.length > 0) {
        const firstLog = logs.data[0];
        console.log(`  Latest event: ${firstLog.eventType}`);
        console.log(`  Timestamp: ${firstLog.getTimestampDate()?.toISOString()}`);
      }
    } catch (error) {
      console.log(`✗ Failed to get logs: ${error.message}`);
    }

    console.log('\n');

    // === SUPPRESSIONS API EXAMPLES ===
    console.log('5. SUPPRESSIONS API EXAMPLES');
    console.log('----------------------------');

    // Get suppressions
    try {
      const suppressions = await suppressionsApi.getSuppressions(domain, { limit: 5 });
      console.log(`✓ Retrieved ${suppressions.data.length} suppressions`);

      if (suppressions.data.length > 0) {
        const firstSuppression = suppressions.data[0];
        console.log(`  Latest suppression: ${firstSuppression.type}`);
        console.log(`  Recipient: ${firstSuppression.recipient}`);
      }
    } catch (error) {
      console.log(`✗ Failed to get suppressions: ${error.message}`);
    }

    console.log('\n');

    // === MODEL USAGE EXAMPLES ===
    console.log('6. MODEL USAGE EXAMPLES');
    console.log('------------------------');

    // Using Domain model
    const domainModel = new Domain({
      domain: 'test.example.com',
      is_verified: true,
      created_at: Math.floor(Date.now() / 1000)
    });
    console.log(`✓ Domain model: ${domainModel.toString()}`);
    console.log(`  DNS Config: ${JSON.stringify(domainModel.getDNSConfiguration())}`);

    // Using Credential model
    const credentialModel = new Credential({
      username: 'test_user',
      is_verified: true,
      status: true
    });
    console.log(`✓ Credential model: ${credentialModel.toString()}`);
    console.log(`  Active: ${credentialModel.isActive()}`);

    // Using LogEntry model
    const logModel = new LogEntry({
      event_type: 'delivered',
      recipient: 'test@example.com',
      timestamp: Math.floor(Date.now() / 1000)
    });
    console.log(`✓ LogEntry model: ${logModel.toString()}`);
    console.log(`  Category: ${logModel.getEventCategory()}`);

    // Using Suppression model
    const suppressionModel = new Suppression({
      recipient: 'suppressed@example.com',
      type: 'bounce',
      reason: 'Hard bounce'
    });
    console.log(`✓ Suppression model: ${suppressionModel.toString()}`);
    console.log(`  Category: ${suppression.getCategory()}`);

    console.log('\n=== EXAMPLES COMPLETED ===\n');

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the comprehensive example
comprehensiveExample().catch(console.error);