const { SmtpClient, CredentialsApi } = require('../dist');

async function example() {
  // Example configuration
  const username = 'your_username';
  const token = 'your_token';
  const domain = 'example.com';

  try {
    // Initialize the client with Basic Auth (used for all endpoints)
    const client = new SmtpClient(username, token);

    // Initialize API classes
    const credentialsApi = new CredentialsApi(client);

    console.log('=== KirimEmail SMTP Node.js SDK Usage Examples ===\n');

    // === BASIC AUTH API EXAMPLES ===
    console.log('1. BASIC AUTH API EXAMPLES');
    console.log('--------------------------');

    // List credentials using regular domain endpoints
    try {
      const credentials = await credentialsApi.listCredentials(domain, { limit: 5 });
      console.log(`✓ Listed ${credentials.data.length} credentials for domain: ${domain}`);

      if (credentials.data.length > 0) {
        const firstCredential = credentials.data[0];
        console.log(`  First credential: ${firstCredential.username}`);
        console.log(`  Verified: ${firstCredential.isVerified ? 'Yes' : 'No'}`);
        console.log(`  Active: ${firstCredential.isActive() ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`✗ Failed to list credentials: ${error.message}`);
    }

    // Create a new credential
    try {
      const testUsername = `test_user_${Date.now()}`;
      const result = await credentialsApi.createCredential(domain, testUsername);
      console.log(`✓ Created credential: ${result.success ? 'Success' : 'Failed'}`);

      if (result.success && result.data.credential) {
        const credential = result.data.credential;
        console.log(`  Username: ${credential.username}`);
        console.log(`  Generated password: ${credential.password}`);
        console.log(`  Remote synced: ${credential.remoteSynced ? 'Yes' : 'No'}`);
        console.log('  IMPORTANT: Store this password securely as it cannot be retrieved later!');

        // Test getting the credential we just created
        try {
          const credentialDetails = await credentialsApi.getCredential(domain, credential.userSmtpGuid);
          console.log(`✓ Retrieved credential details: ${credentialDetails.data.username}`);
        } catch (error) {
          console.log(`✗ Failed to get credential details: ${error.message}`);
        }

        // Test resetting password
        try {
          const resetResult = await credentialsApi.resetPassword(domain, credential.userSmtpGuid);
          console.log(`✓ Reset password: ${resetResult.success ? 'Success' : 'Failed'}`);
          if (resetResult.success && resetResult.data.credential) {
            console.log(`  New password: ${resetResult.data.credential.password}`);
            console.log(`  Strength info: ${JSON.stringify(resetResult.data.strength_info)}`);
          }
        } catch (error) {
          console.log(`✗ Failed to reset password: ${error.message}`);
        }

        // Clean up - delete the test credential
        try {
          const deleteResult = await credentialsApi.deleteCredential(domain, credential.userSmtpGuid);
          console.log(`✓ Deleted test credential: ${deleteResult.success ? 'Success' : 'Failed'}`);
        } catch (error) {
          console.log(`✗ Failed to delete test credential: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`✗ Failed to create credential: ${error.message}`);
    }

    console.log('\n');

    // === TRANSACTIONAL API EXAMPLES ===
    console.log('2. TRANSACTIONAL API EXAMPLES');
    console.log('-----------------------------');

    // List credentials using transactional endpoints with domain header
    try {
      const credentials = await credentialsApi.listTransactionalCredentials(domain, { limit: 5 });
      console.log(`✓ Listed ${credentials.data.length} transactional credentials for domain: ${domain}`);

      if (credentials.data.length > 0) {
        const firstCredential = credentials.data[0];
        console.log(`  First credential: ${firstCredential.username}`);
        console.log(`  Verified: ${firstCredential.isVerified ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`✗ Failed to list transactional credentials: ${error.message}`);
    }

    // Create credential using transactional endpoint
    try {
      const testUsername = `transactional_user_${Date.now()}`;
      const result = await credentialsApi.createTransactionalCredential(domain, testUsername);
      console.log(`✓ Created transactional credential: ${result.success ? 'Success' : 'Failed'}`);

      if (result.success && result.data.credential) {
        const credential = result.data.credential;
        console.log(`  Username: ${credential.username}`);
        console.log(`  Generated password: ${credential.password}`);
        console.log(`  Remote synced: ${credential.remoteSynced ? 'Yes' : 'No'}`);

        // Test getting the transactional credential we just created
        try {
          const credentialDetails = await credentialsApi.getTransactionalCredential(domain, credential.userSmtpGuid);
          console.log(`✓ Retrieved transactional credential details: ${credentialDetails.data.username}`);
        } catch (error) {
          console.log(`✗ Failed to get transactional credential details: ${error.message}`);
        }

        // Test resetting password for transactional credential
        try {
          const resetResult = await credentialsApi.resetTransactionalPassword(domain, credential.userSmtpGuid);
          console.log(`✓ Reset transactional password: ${resetResult.success ? 'Success' : 'Failed'}`);
          if (resetResult.success && resetResult.data.credential) {
            console.log(`  New password: ${resetResult.data.credential.password}`);
          }
        } catch (error) {
          console.log(`✗ Failed to reset transactional password: ${error.message}`);
        }

        // Clean up - delete the test transactional credential
        try {
          const deleteResult = await credentialsApi.deleteTransactionalCredential(domain, credential.userSmtpGuid);
          console.log(`✓ Deleted test transactional credential: ${deleteResult.success ? 'Success' : 'Failed'}`);
        } catch (error) {
          console.log(`✗ Failed to delete test transactional credential: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`✗ Failed to create transactional credential: ${error.message}`);
    }

    console.log('\n');

    // === ERROR HANDLING EXAMPLES ===
    console.log('3. ERROR HANDLING EXAMPLES');
    console.log('---------------------------');

    // Example of specific exception handling
    try {
      // This will likely fail with invalid credentials
      const invalidClient = new SmtpClient('invalid_user', 'invalid_token');
      const invalidCredentialsApi = new CredentialsApi(invalidClient);
      await invalidCredentialsApi.listCredentials(domain);
    } catch (error) {
      if (error.name === 'AuthenticationException') {
        console.log(`✓ Caught authentication error: ${error.message}`);
      } else if (error.name === 'ValidationException') {
        console.log(`✓ Caught validation error: ${error.message}`);
        if (error.hasErrors()) {
          console.log(`  Errors: ${JSON.stringify(error.getErrorMessages())}`);
        }
      } else if (error.name === 'NotFoundException') {
        console.log(`✓ Caught not found error: ${error.message}`);
      } else if (error.name === 'ServerException') {
        console.log(`✓ Caught server error: ${error.message}`);
      } else {
        console.log(`✓ Caught API error: ${error.message}`);
      }
    }

    console.log('\n=== EXAMPLES COMPLETED ===\n');

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the example
example().catch(console.error);