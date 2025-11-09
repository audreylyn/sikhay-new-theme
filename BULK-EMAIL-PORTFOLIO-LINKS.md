# Bulk Send Portfolio Links to Students via Email

## Overview

This guide will help you set up an **automated email system** that sends portfolio links to all students who have completed quizzes. Students will receive an email with:
- A link to their personal portfolio
- A message encouraging them to review their lessons
- Their overall performance summary

---

## Step-by-Step Setup

### 1. Add Email Sending Function to Apps Script

1. Open your Google Sheet (SIKHAY Quiz Summary)
2. Go to **Extensions** → **Apps Script**
3. **Add this new function** to your existing script (don't delete the existing code):

```javascript
// ============================================
// BULK EMAIL FUNCTIONS
// ============================================

/**
 * Sends portfolio links to all students via email
 * Can be run manually or scheduled
 * Shows confirmation dialog before sending
 */
function sendPortfolioLinksToAllStudents() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var summarySheet = spreadsheet.getSheetByName('Summary');
  
  if (!summarySheet) {
    SpreadsheetApp.getUi().alert('Error', 'Summary sheet not found', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Get all data from Summary sheet
  var data = summarySheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find column indices
  var emailCol = headers.indexOf('Email');
  var nameCol = headers.indexOf('Full Name');
  var portfolioCol = headers.indexOf('Portfolio Link');
  var yearSectionCol = headers.indexOf('Year & Section');
  
  if (emailCol === -1 || nameCol === -1 || portfolioCol === -1) {
    SpreadsheetApp.getUi().alert('Error', 'Required columns not found in Summary sheet', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Group students by email (to avoid sending duplicate emails)
  var studentMap = {};
  var sectionCounts = {};
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var email = row[emailCol];
    var name = row[nameCol];
    var portfolioLink = row[portfolioCol];
    var yearSection = row[yearSectionCol];
    
    if (email && portfolioLink) {
      if (!studentMap[email]) {
        studentMap[email] = {
          name: name,
          email: email,
          portfolioLink: portfolioLink,
          yearSection: yearSection,
          submissionCount: 0
        };
        
        // Count by section
        if (!sectionCounts[yearSection]) {
          sectionCounts[yearSection] = 0;
        }
        sectionCounts[yearSection]++;
      }
      studentMap[email].submissionCount++;
    }
  }
  
  var totalStudents = Object.keys(studentMap).length;
  
  if (totalStudents === 0) {
    SpreadsheetApp.getUi().alert('No Students', 'No students found to send emails to.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Build confirmation message with breakdown by section
  var confirmMessage = 'BULK EMAIL CONFIRMATION\n\n';
  confirmMessage += '═══════════════════════════════════\n\n';
  confirmMessage += 'SUMMARY:\n';
  confirmMessage += '• Total unique students: ' + totalStudents + '\n';
  confirmMessage += '• Each student will receive ONE email only\n\n';
  confirmMessage += 'BREAKDOWN BY SECTION:\n';
  
  var sections = Object.keys(sectionCounts).sort();
  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    confirmMessage += '   • ' + section + ': ' + sectionCounts[section] + ' students\n';
  }
  
  confirmMessage += '\n═══════════════════════════════════\n\n';
  confirmMessage += 'WARNING: This will send ' + totalStudents + ' emails.\n';
  confirmMessage += 'Daily quota: Check remaining quota first!\n\n';
  confirmMessage += 'Do you want to proceed?';
  
  // Show confirmation dialog
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Confirm Bulk Email',
    confirmMessage,
    ui.ButtonSet.YES_NO
  );
  
  // If user clicks NO or closes dialog, cancel
  if (response !== ui.Button.YES) {
    ui.alert('Cancelled', 'Bulk email sending cancelled.', ui.ButtonSet.OK);
    return;
  }
  
  // User confirmed, proceed with sending
  var successCount = 0;
  var failCount = 0;
  var failedEmails = [];
  
  for (var email in studentMap) {
    var student = studentMap[email];
    try {
      sendPortfolioEmail(student);
      successCount++;
      Logger.log('✓ Email sent to: ' + student.name + ' (' + email + ')');
      Utilities.sleep(1000); // Wait 1 second between emails to avoid quota limits
    } catch (error) {
      failCount++;
      failedEmails.push(email);
      Logger.log('✗ Failed to send to ' + email + ': ' + error.toString());
    }
  }
  
  // Show final summary
  var resultMessage = 'BULK EMAIL COMPLETED!\n\n';
  resultMessage += '═══════════════════════════════════\n\n';
  resultMessage += 'RESULTS:\n';
  resultMessage += 'Successfully sent: ' + successCount + '\n';
  resultMessage += 'Failed: ' + failCount + '\n';
  resultMessage += 'Total unique students: ' + totalStudents + '\n\n';
  
  if (failCount > 0) {
    resultMessage += 'FAILED EMAILS:\n';
    for (var i = 0; i < failedEmails.length; i++) {
      resultMessage += '   • ' + failedEmails[i] + '\n';
    }
    resultMessage += '\nPlease check these emails manually.\n\n';
  }
  
  resultMessage += '═══════════════════════════════════\n\n';
  resultMessage += 'Check View → Executions for detailed logs.';
  
  ui.alert('Email Summary', resultMessage, ui.ButtonSet.OK);
  Logger.log(resultMessage);
}

/**
 * Sends a single portfolio email to a student
 */
function sendPortfolioEmail(student) {
  var subject = 'SIKHAY - Iyong Portfolio ng mga Quiz Submissions';
  
  var htmlBody = 
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF8E1; border-radius: 10px;">' +
    '<div style="background: linear-gradient(135deg, #92400E 0%, #78350F 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">' +
    '<h1 style="color: #FFF; margin: 0; font-size: 28px;">SIKHAY</h1>' +
    '<p style="color: #FED7AA; margin: 5px 0 0 0;">Student Assistant Bot</p>' +
    '</div>' +
    '<div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">' +
    '<p style="font-size: 18px; color: #92400E;"><strong>Magandang araw, ' + student.name + '!</strong></p>' +
    '<p style="color: #44403C; line-height: 1.6;">Narito ang iyong personal na portfolio na naglalaman ng lahat ng iyong mga quiz submissions sa SIKHAY system.</p>' +
    
    '<div style="background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0;">' +
    '<p style="margin: 5px 0; color: #92400E;"><strong>Iyong Impormasyon:</strong></p>' +
    '<p style="margin: 5px 0; color: #44403C;">Pangalan: ' + student.name + '</p>' +
    '<p style="margin: 5px 0; color: #44403C;">Email: ' + student.email + '</p>' +
    '<p style="margin: 5px 0; color: #44403C;">Baitang at Pangkat: ' + student.yearSection + '</p>' +
    '<p style="margin: 5px 0; color: #44403C;">Bilang ng Submissions: ' + student.submissionCount + '</p>' +
    '</div>' +
    
    '<div style="text-align: center; margin: 30px 0;">' +
    '<a href="' + student.portfolioLink + '" style="display: inline-block; background: linear-gradient(135deg, #92400E 0%, #78350F 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Buksan ang Aking Portfolio</a>' +
    '</div>' +
    
    '<div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">' +
    '<p style="margin: 5px 0; color: #1E40AF;"><strong>Paalala:</strong></p>' +
    '<ul style="color: #1E3A8A; margin: 10px 0; padding-left: 20px;">' +
    '<li>Suriin ang iyong mga sagot at matuto sa mga pagkakamali</li>' +
    '<li>Tingnan ang iyong mga attempts at improvement</li>' +
    '<li>Gamitin ito bilang reference para sa pag-aaral</li>' +
    '<li>I-bookmark ang link para sa madaling access</li>' +
    '</ul>' +
    '</div>' +
    
    '<div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">' +
    '<p style="margin: 5px 0; color: #374151;"><strong>Mga Aralin at Sanggunian:</strong></p>' +
    '<p style="margin: 10px 0; color: #6B7280;">Para sa karagdagang aralin at resources, bisitahin ang:</p>' +
    '<a href="https://lins-documentation.gitbook.io/mcismartspacedocs" style="color: #92400E; font-weight: bold;">GitBook Resources</a>' +
    '</div>' +
    
    '<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">' +
    
    '<p style="color: #6B7280; font-size: 12px; text-align: center; margin: 10px 0;">Ang portfolio na ito ay awtomatikong ginawa ng SIKHAY System</p>' +
    '<p style="color: #6B7280; font-size: 12px; text-align: center; margin: 5px 0;"><em>Inihanda ni Ginoong Marc Licaros</em></p>' +
    '<p style="color: #6B7280; font-size: 12px; text-align: center; margin: 5px 0;">Pamantasan ng Lungsod ng Valenzuela - Filipino Department</p>' +
    '</div>' +
    '</div>';
  
  var plainBody = 
    'Magandang araw, ' + student.name + '!\n\n' +
    'Narito ang iyong personal na portfolio na naglalaman ng lahat ng iyong mga quiz submissions sa SIKHAY system.\n\n' +
    'Iyong Impormasyon:\n' +
    '• Pangalan: ' + student.name + '\n' +
    '• Email: ' + student.email + '\n' +
    '• Baitang at Pangkat: ' + student.yearSection + '\n' +
    '• Bilang ng Submissions: ' + student.submissionCount + '\n\n' +
    'Portfolio Link: ' + student.portfolioLink + '\n\n' +
    'Paalala:\n' +
    '• Suriin ang iyong mga sagot at matuto sa mga pagkakamali\n' +
    '• Tingnan ang iyong mga attempts at improvement\n' +
    '• Gamitin ito bilang reference para sa pag-aaral\n\n' +
    'Mga Aralin at Sanggunian:\n' +
    'https://lins-documentation.gitbook.io/mcismartspacedocs\n\n' +
    '---\n' +
    'Inihanda ni Ginoong Marc Licaros\n' +
    'Pamantasan ng Lungsod ng Valenzuela - Filipino Department';
  
  MailApp.sendEmail({
    to: student.email,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody
  });
}

/**
 * Sends portfolio link to a single student (based on email)
 * Useful for sending to individual students
 */
function sendToSingleStudent(studentEmail) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var summarySheet = spreadsheet.getSheetByName('Summary');
  
  if (!summarySheet) {
    Logger.log('Error: Summary sheet not found');
    return;
  }
  
  var data = summarySheet.getDataRange().getValues();
  var headers = data[0];
  
  var emailCol = headers.indexOf('Email');
  var nameCol = headers.indexOf('Full Name');
  var portfolioCol = headers.indexOf('Portfolio Link');
  var yearSectionCol = headers.indexOf('Year & Section');
  
  // Find the student's data
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[emailCol] === studentEmail) {
      var student = {
        name: row[nameCol],
        email: row[emailCol],
        portfolioLink: row[portfolioCol],
        yearSection: row[yearSectionCol],
        submissionCount: 1 // You could count this if needed
      };
      
      try {
        sendPortfolioEmail(student);
        SpreadsheetApp.getUi().alert('Success', 'Email sent to ' + studentEmail, SpreadsheetApp.getUi().ButtonSet.OK);
        Logger.log('✓ Email sent to: ' + studentEmail);
      } catch (error) {
        SpreadsheetApp.getUi().alert('Error', 'Failed to send email: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
        Logger.log('✗ Failed: ' + error.toString());
      }
      return;
    }
  }
  
  SpreadsheetApp.getUi().alert('Not Found', 'Student with email ' + studentEmail + ' not found', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Sends portfolio links to students from a specific section
 */
function sendToSection(sectionName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var summarySheet = spreadsheet.getSheetByName('Summary');
  
  if (!summarySheet) {
    Logger.log('Error: Summary sheet not found');
    return;
  }
  
  var data = summarySheet.getDataRange().getValues();
  var headers = data[0];
  
  var emailCol = headers.indexOf('Email');
  var nameCol = headers.indexOf('Full Name');
  var portfolioCol = headers.indexOf('Portfolio Link');
  var yearSectionCol = headers.indexOf('Year & Section');
  
  var studentMap = {};
  
  // Find students from specific section
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var yearSection = row[yearSectionCol];
    
    if (yearSection === sectionName) {
      var email = row[emailCol];
      if (email && !studentMap[email]) {
        studentMap[email] = {
          name: row[nameCol],
          email: email,
          portfolioLink: row[portfolioCol],
          yearSection: row[yearSectionCol],
          submissionCount: 0
        };
      }
      if (studentMap[email]) {
        studentMap[email].submissionCount++;
      }
    }
  }
  
  // Send emails
  var count = 0;
  for (var email in studentMap) {
    try {
      sendPortfolioEmail(studentMap[email]);
      count++;
      Logger.log('✓ Email sent to: ' + email);
      Utilities.sleep(1000);
    } catch (error) {
      Logger.log('✗ Failed to send to ' + email + ': ' + error.toString());
    }
  }
  
  var message = count + ' email(s) sent to ' + sectionName + ' students.';
  SpreadsheetApp.getUi().alert('Email Summary', message, SpreadsheetApp.getUi().ButtonSet.OK);
  Logger.log(message);
}

/**
 * Shows dialog to select section
 */
function showSectionDialog() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Send to Section',
    'Enter section (e.g., BSED 4-1, BSED 4-2, etc.):',
    ui.ButtonSet.OK_CANCEL
  );
  
  var button = result.getSelectedButton();
  var section = result.getResponseText();
  
  if (button == ui.Button.OK && section) {
    sendToSection(section.trim());
  }
}
```

---

### 2. Add Custom Menu to Google Sheet

Add this function to make it easier to access the email functions from a menu:

```javascript
/**
 * Creates a custom menu when the spreadsheet opens
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 SIKHAY Email')
      .addItem('📤 Send to All Students', 'sendPortfolioLinksToAllStudents')
      .addItem('� Send to Specific Section...', 'showSectionDialog')
      .addSeparator()
      .addItem('👤 Send to Single Student...', 'showSingleStudentDialog')
      .addSeparator()
      .addItem('� Check Email Quota', 'checkEmailQuota')
      .addToUi();
}

/**
 * Checks remaining email quota
 */
function checkEmailQuota() {
  var quota = MailApp.getRemainingDailyQuota();
  var message = '📊 EMAIL QUOTA STATUS\n\n';
  message += '═══════════════════════════════════\n\n';
  message += '📧 Remaining emails today: ' + quota + '\n\n';
  
  if (quota > 1000) {
    message += '✅ Status: Excellent\n';
    message += 'You have plenty of quota remaining.';
  } else if (quota > 500) {
    message += '✅ Status: Good\n';
    message += 'Sufficient quota for bulk sending.';
  } else if (quota > 100) {
    message += '⚠️ Status: Moderate\n';
    message += 'Consider sending by section.';
  } else if (quota > 0) {
    message += '⚠️ Status: Low\n';
    message += 'Send to individual students only.';
  } else {
    message += '❌ Status: Depleted\n';
    message += 'Daily quota exhausted. Try again tomorrow.';
  }
  
  message += '\n\n═══════════════════════════════════\n\n';
  message += 'Quota resets daily at midnight PST.';
  
  SpreadsheetApp.getUi().alert('Email Quota', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Shows a dialog to send email to a single student
 */
function showSingleStudentDialog() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Send to Single Student',
    'Enter the student email address:',
    ui.ButtonSet.OK_CANCEL
  );
  
  var button = result.getSelectedButton();
  var email = result.getResponseText();
  
  if (button == ui.Button.OK && email) {
    sendToSingleStudent(email.trim());
  }
}
```

---

### 3. Save and Test

1. Click **Save** (disk icon)
2. **Close and reopen your Google Sheet**
3. You should see a new menu: **SIKHAY Email**
4. Click it to see the options

---

## How to Use the Email System

### Option 1: Send to All Students (Bulk)

1. Open your Google Sheet
2. Click **📧 SIKHAY Email** → **📤 Send to All Students**
3. **Review the confirmation modal** showing:
   - Total number of unique students
   - Breakdown by section (BSED 4-1, 4-2, etc.)
   - Email quota warning
4. Click **YES** to proceed or **NO** to cancel
5. Wait for emails to send (1 second delay between each)
6. See final summary with success/failure counts

**Important**: Each student receives **ONLY ONE email**, even if they have multiple quiz submissions. The system automatically groups by email address.

### Option 2: Send to Specific Section

Perfect for sending to one class at a time:
1. Click **📧 SIKHAY Email** → **� Send to Specific Section...**
2. Enter section name (e.g., `BSED 4-2`)
3. Only students from that section will receive emails
4. See summary of emails sent

### Option 3: Send to a Single Student

If a student needs their link resent:
1. Click **📧 SIKHAY Email** → **👤 Send to Single Student...**
2. Enter their email address
3. Click OK

### Option 4: Check Email Quota

Before sending bulk emails:
1. Click **📧 SIKHAY Email** → **📊 Check Email Quota**
2. See your remaining daily quota
3. Plan your sending strategy accordingly

---

## Email Features

### What Students Receive:

**Email Subject**: "SIKHAY - Iyong Portfolio ng mga Quiz Submissions"

**Email Content Includes**:
- Personalized greeting with their name
- Their student information (name, email, section, submission count)
- **Clickable button** to open their portfolio
- Reminders on how to use the portfolio
- Link to GitBook resources
- Professional signature with your name

### Email Design:
- Beautiful HTML design with PLV colors (amber/brown theme)
- Mobile-responsive
- Clickable button for portfolio link
- Plain text fallback for email clients that don't support HTML
- Professional branding

---

## Important: Email Quotas

Google Apps Script has email sending limits:

### Free Gmail Accounts:
- **100 emails per day**

### Google Workspace (Education) Accounts:
- **1,500 emails per day**

### Tips to Stay Within Limits:
1. **Check quota first** using the Check Email Quota option
2. **Send by Section** instead of all students at once
3. Use **"Send to Single Student"** for individual requests
4. Schedule bulk emails weekly instead of daily
5. The script automatically waits 1 second between emails to avoid rate limits
6. **No duplicate emails**: Each student receives only ONE email, even if you run the script multiple times (unless new submissions are added)

### Check Your Quota Usage:

The quota check is already included in the menu! Just click **SIKHAY Email** → **Check Email Quota** to see:
- Remaining emails for today
- Status indicator (Excellent/Good/Moderate/Low/Depleted)
- Recommendations based on remaining quota

---

## Advanced: Schedule Automatic Emails

You can set up automatic weekly emails:

### 1. Create a Trigger

**Note**: Automatic triggers will skip the confirmation modal, so use with caution!

1. In Apps Script, click **Triggers** (clock icon on left sidebar)
2. Click **+ Add Trigger**
3. Settings:
   - Function: `sendPortfolioLinksToAllStudents`
   - Deployment: Head
   - Event source: Time-driven
   - Type of time based trigger: Week timer
   - Day of week: Friday (or your preferred day)
   - Time of day: 6pm to 7pm (or your preferred time)
4. Click **Save**

### 2. What Happens:
- Every Friday at 6pm, the script automatically sends emails
- Students receive their portfolio links
- No manual work required
- **Warning**: The confirmation modal is bypassed in automatic triggers

### 3. Alternative: Manual Sending (Recommended)
Instead of automatic triggers, we recommend:
- Send manually weekly after reviewing the confirmation modal
- You maintain full control over when emails are sent
- You can verify student count before sending

---

## Email Customization

### Change the Subject Line:
Find this line in `sendPortfolioEmail`:
```javascript
var subject = '📚 SIKHAY - Iyong Portfolio ng mga Quiz Submissions';
```

Change it to:
```javascript
var subject = '🎓 SIKHAY - Suriin ang Iyong Progress!';
```

### Change the Message:
Edit the `htmlBody` and `plainBody` variables in the `sendPortfolioEmail` function

### Add Your School Logo:
Add this to the HTML body:
```javascript
'<img src="YOUR_LOGO_URL" style="width: 80px; height: 80px; margin: 0 auto; display: block;">' +
```

### Change Colors:
- Find color codes like `#92400E` (brown) and `#FFF8E1` (light yellow)
- Replace with your school colors

---

## Testing Before Bulk Send

**IMPORTANT**: Test with yourself first!

1. Add a test row to your Summary sheet with YOUR email
2. Click **SIKHAY Email** → **Send to Single Student**
3. Enter your email
4. Check that you receive the email correctly
5. Verify the portfolio link works
6. Check formatting on mobile and desktop
7. **Then** send to all students

---

## Troubleshooting

### "Service invoked too many times in a short time"
- You're hitting rate limits
- Wait an hour and try again
- Or send to smaller batches

### "Invalid email address"
- Some students may have entered invalid emails
- Check the Summary sheet for typos
- Fix the email addresses manually

### "Authorization required"
- Run any email function manually first
- Click **Review Permissions** → **Allow**
- Then the menu functions will work

### Emails going to spam
- Ask students to check spam folder
- Add your Google account to their contacts
- Use a Google Workspace (school) account instead of personal Gmail

### Emails not sending
- Check your quota: Click **SIKHAY Email** → **Check Email Quota**
- Verify the Summary sheet has data
- Check the Execution Log: **View** → **Executions**

---

## Email Statistics

Want to track who opened emails? Google Apps Script doesn't support this natively, but you can:

1. Use a URL shortener with analytics (bit.ly, tinyurl.com)
2. Shorten each portfolio link before sending
3. Track clicks through the shortener dashboard

---

## Sample Email Preview

```
Subject: SIKHAY - Iyong Portfolio ng mga Quiz Submissions

Magandang araw, Juan Dela Cruz!

Narito ang iyong personal na portfolio na naglalaman ng lahat 
ng iyong mga quiz submissions sa SIKHAY system.

Iyong Impormasyon:
Pangalan: Juan Dela Cruz
Email: juan@email.com
Baitang at Pangkat: BSED 4-2
Bilang ng Submissions: 5

[Buksan ang Aking Portfolio] (big button)

Paalala:
• Suriin ang iyong mga sagot at matuto sa mga pagkakamali
• Tingnan ang iyong mga attempts at improvement
• Gamitin ito bilang reference para sa pag-aaral
• I-bookmark ang link para sa madaling access

Mga Aralin at Sanggunian:
Para sa karagdagang aralin at resources, bisitahin ang:
GitBook Resources

---
Inihanda ni Ginoong Marc Licaros
Pamantasan ng Lungsod ng Valenzuela - Filipino Department
```

---

## Best Practices

**Do:**
- Send weekly summary emails (every Friday)
- Test with yourself first
- Send to students by section after each quiz day
- Keep message encouraging and positive
- Include clear instructions

**Don't:**
- Send to all students multiple times per day (quota waste)
- Send without testing first
- Include sensitive information in plain text
- Forget to check your email quota

---

## Summary

You now have **four ways** to send portfolio links:

1. **📤 Bulk Send (All Students)** - Send to everyone at once with confirmation modal
2. **� By Section** - Send to specific class (BSED 4-1, 4-2, etc.)
3. **👤 Single Student** - Send to individual students (as needed)
4. **📊 Check Quota** - Monitor remaining daily email quota

### Key Features:
✅ **No Duplicate Emails** - Each student receives only ONE email, even if they submitted multiple times
✅ **Confirmation Modal** - Review student count and breakdown before sending
✅ **Section Breakdown** - See how many students in each section before sending
✅ **Quota Monitoring** - Check remaining emails before bulk sending
✅ **Smart Grouping** - System automatically groups submissions by student email

Plus optional **automatic scheduling** for hands-free operation (bypasses confirmation modal)!

Students can now:
- ✅ Review their quiz answers anytime
- ✅ Track their own progress
- ✅ Learn from their mistakes
- ✅ Prepare for future quizzes

---

**Your complete SIKHAY system now has:**
- ✅ Quiz application with multiple question types
- ✅ Student information collection
- ✅ Google Sheets summary tracking
- ✅ Automatic portfolio system with Google Drive
- ✅ **Bulk email system for sharing portfolios**

Everything is automated! 🎉
