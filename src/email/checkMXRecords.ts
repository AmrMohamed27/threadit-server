import dns from "dns";

// Check if an email provider exists in MX or A/AAAA records, which provides a fast -but not 100% accurate- way to check if an email provider exists.
// This doesn't check if the actual email is valid or not, instead checking if the email provider is real or not.
export const checkMXRecords = (email: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const domain = email.split("@")[1]; // Extract domain from email

    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) {
        dns.resolve(domain, (err, addresses) => {
          if (err || addresses.length === 0) {
            console.log(`❌ No A/AAAA records found for ${domain}`);
            resolve(false);
          } else {
            console.log(`✅ A/AAAA records found for ${domain}:`, addresses);
            resolve(true);
          }
        });
      } else {
        console.log(`✅ MX records found for ${domain}:`, addresses);
        resolve(true);
      }
    });
  });
};
