/**
 * Sets the "FederationRoleAppstreamProd" custom attribute to "true" for all members of the "appstream-prod@wehkamp.nl" group.
 *
 * This script requires the Admin SDK Directory Service to be enabled.
 * Go to "Services" in the Apps Script editor and enable "Admin SDK".
 *
 * It is recommended to run this function manually from the Apps Script editor
 * or set it to run on a schedule using a trigger.
 */
function setFederationRoleAppstreamProdAttributeForGroupMembers() {
  // Define the group name, custom schema, and attribute field.
  const GROUP_EMAIL = 'appstream-prod@wehkamp.nl'; // Replace with the actual group email
  const CUSTOM_SCHEMA = 'FederationRoleAppstreamProd'; // Replace with your custom schema name
  const CUSTOM_ATTRIBUTE = 'FederationRoleAppstreamProd'; // Replace with your custom attribute field name
  
  // Define the value to set.
  const ATTRIBUTE_VALUE = 'arn:aws:iam::061051253525:role/AppstreamProdRole,arn:aws:iam::061051253525:saml-provider/appstream-prod-saml-provider';

  try {
    // Check if the Admin SDK Directory Service is available.
    if (!AdminDirectory.Members) {
      Logger.log('The Admin SDK Directory Service is not available. Please ensure it is enabled in your Apps Script project by going to the "Services" menu.');
      return;
    }else{
      Logger.log('Admin SDK is available, proceeding')
    }

    // 1. Get the group object to retrieve its members.
    Logger.log('Fetching members for group: ' + GROUP_EMAIL);
    const members = AdminDirectory.Members.list(GROUP_EMAIL).members;

    if (!members || members.length === 0) {
      Logger.log('No members found in the group.');
      return;
    }
    
    // Log the number of members found.
    Logger.log('Found ' + members.length + ' members.');


    // 2. Iterate through each member and update their custom attribute.
    members.forEach(member => {
      // Get the user's primary email.
      const userKey = member.email;

      try {
        // First, fetch the current user to check their existing attributes.
        const user = AdminDirectory.Users.get(userKey, {
          projection: 'custom',
          customFieldMask: CUSTOM_SCHEMA
        });

        // Check if the user already has the attribute set to the desired value.
        const customSchemas = user.customSchemas || {};
        const customAttributeValue = customSchemas[CUSTOM_SCHEMA]?.[CUSTOM_ATTRIBUTE];

        if (customAttributeValue === ATTRIBUTE_VALUE) {
          Logger.log('Skipping user ' + userKey + '. The attribute is already set to ' + ATTRIBUTE_VALUE);
          return;
        }

        // Create the custom schema object to be updated.
        // This structure is specific to updating custom attributes via the API.
        const userUpdate = {
          customSchemas: {
            [CUSTOM_SCHEMA]: {
              [CUSTOM_ATTRIBUTE]: ATTRIBUTE_VALUE
            }
          }
        };

        // Use the AdminDirectory.Users.update method to patch the user's profile.
        AdminDirectory.Users.update(userUpdate, userKey);
        Logger.log('Successfully updated user: ' + userKey);

      } catch (e) {
        Logger.log('Error updating user ' + userKey + ': ' + e.message);
      }
    });

    Logger.log('Script execution completed.');
  } catch (e) {
    Logger.log('An error occurred during script execution: ' + e.message + '. Please ensure the provided group email is correct and the Admin SDK Directory Service is enabled.');
  }
}
