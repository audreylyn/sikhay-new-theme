# SIKHAY Quiz - Student Portfolio System Setup Guide

## Overview

This system creates **automatic student portfolios** in Google Drive:
- Each student gets ONE Google Doc that contains ALL their quiz submissions
- Documents are automatically organized into class folders (BSED 4-1, 4-2, etc.)
- Every quiz submission **appends** to their existing portfolio
- **Zero manual filing required** - everything is automatic!

---

## Step-by-Step Setup Instructions

### 1. Create Your Main Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Click **+ New** → **Folder**
3. Name it: **`Sikhay Responses`**
4. **IMPORTANT**: Right-click the folder → Click **Share**
5. Click **Change to anyone with the link**
6. Set permission to: **Editor** (so the script can create files)
7. Click **Copy link** and save it somewhere
https://drive.google.com/drive/folders/1lqgoB6USbmh4ooAG624VDJpYOmOvkAR1?usp=sharing
8. From the link, **extract the Folder ID**:
   - Link looks like: `https://drive.google.com/drive/folders/1lqgoB6USbmh4ooAG624VDJpYOmOvkAR1?usp=sharing`
   - The Folder ID is: `1lqgoB6USbmh4ooAG624VDJpYOmOvkAR1` (everything after `/folders/`)
   - **Write this down - you'll need it!**

### 2. Create Your Google Sheet (For Summary)

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"SIKHAY Quiz Summary"**
4. Rename Sheet1 to: **"Summary"**
5. Add these column headers in Row 1:
   - A1: Timestamp
   - B1: Full Name
   - C1: Year & Section
   - D1: Email
   - E1: Access Code
   - F1: Start Time
   - G1: End Time
   - H1: Score
   - I1: Total Questions
   - J1: Percentage
   - K1: Portfolio Link

---

### 3. Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy and paste this complete code:

```javascript
// ============================================
// CONFIGURATION - PASTE YOUR FOLDER ID HERE
// ============================================
var MAIN_FOLDER_ID = '1lqgoB6USbmh4ooAG624VDJpYOmOvkAR1'; // Replace with your Sikhay Responses folder ID

function doPost(e) {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    
    // Get or create Summary sheet
    var summarySheet = spreadsheet.getSheetByName('Summary');
    if (!summarySheet) {
      summarySheet = spreadsheet.insertSheet('Summary');
      summarySheet.appendRow([
        'Timestamp', 'Full Name', 'Year & Section', 'Email', 'Access Code',
        'Start Time', 'End Time', 'Score', 'Total Questions', 'Percentage', 'Portfolio Link'
      ]);
    }
    
    var timestamp = new Date();
    
    // Create or update student portfolio in Google Drive
    var portfolioUrl = createOrUpdateStudentPortfolio(data, timestamp);
    
    // Add summary row to sheet
    var summaryRow = [
      timestamp,
      data.name,
      data.yearSection,
      data.email,
      data.accessCode,
      data.startTime,
      data.endTime,
      data.score,
      data.totalQuestions,
      data.percentage + '%',
      portfolioUrl
    ];
    summarySheet.appendRow(summaryRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'portfolioUrl': portfolioUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createOrUpdateStudentPortfolio(data, timestamp) {
  // Get main folder
  var mainFolder = DriveApp.getFolderById(MAIN_FOLDER_ID);
  
  // Get or create class folder (e.g., "BSED 4-2")
  var classFolder = getOrCreateFolder(mainFolder, data.yearSection);
  
  // Get or create student's portfolio document
  var docName = data.email; // Use email as filename
  var doc = getOrCreateDocument(classFolder, docName, data);
  
  // Append quiz results to the document
  appendQuizResults(doc, data, timestamp);
  
  return doc.getUrl();
}

function getOrCreateFolder(parentFolder, folderName) {
  // Check if folder exists
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  // Create new folder if it doesn't exist
  return parentFolder.createFolder(folderName);
}

function getOrCreateDocument(folder, docName, data) {
  // Check if document exists
  var files = folder.getFilesByName(docName);
  
  if (files.hasNext()) {
    // Document exists, return it
    var file = files.next();
    return DocumentApp.openById(file.getId());
  }
  
  // Create new document with student header
  var doc = DocumentApp.create(docName);
  var docFile = DriveApp.getFileById(doc.getId());
  
  // Move to the correct folder
  docFile.moveTo(folder);
  
  // Add student header
  var body = doc.getBody();
  body.appendParagraph(data.name).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Email: ' + data.email);
  body.appendParagraph('Year & Section: ' + data.yearSection);
  body.appendHorizontalRule();
  
  return doc;
}

function appendQuizResults(doc, data, timestamp) {
  var body = doc.getBody();
  
  // Add separator line (except for first quiz)
  if (body.getText().trim().length > 100) {
    body.appendHorizontalRule();
  }
  
  // Add quiz header
  var header = data.accessCode + ' (' + data.score + '/' + data.totalQuestions + ' - ' + data.percentage + '%)';
  body.appendParagraph(header).setHeading(DocumentApp.ParagraphHeading.HEADING2).setBold(true);
  body.appendParagraph('Submitted: ' + timestamp.toLocaleString());
  body.appendParagraph('Started: ' + data.startTime);
  body.appendParagraph('Ended: ' + data.endTime);
  body.appendParagraph(''); // Empty line
  
  // Group answers by section
  var sections = {};
  data.answers.forEach(function(answer) {
    if (!sections[answer.section]) {
      sections[answer.section] = [];
    }
    sections[answer.section].push(answer);
  });
  
  // Add each section
  for (var sectionName in sections) {
    body.appendParagraph('Section: ' + sectionName).setHeading(DocumentApp.ParagraphHeading.HEADING3);
    
    var answers = sections[sectionName];
    answers.forEach(function(answer, index) {
      var questionPara = body.appendParagraph('Q' + answer.questionNumber + ': ' + answer.question);
      questionPara.setBold(true);
      
      body.appendParagraph('Student Answer: ' + answer.studentAnswer);
      body.appendParagraph('Correct Answer: ' + answer.correctAnswer);
      
      var resultPara = body.appendParagraph('Result: ' + (answer.isCorrect ? '✓ CORRECT' : '✗ INCORRECT') + ' (Attempts: ' + answer.attempts + ')');
      if (answer.isCorrect) {
        resultPara.setForegroundColor('#0f9d58'); // Green
      } else {
        resultPara.setForegroundColor('#db4437'); // Red
      }
      
      body.appendParagraph(''); // Empty line between questions
    });
  }
  
  doc.saveAndClose();
}

// Test function (optional)
function testPortfolio() {
  var testData = {
    name: "Test Student",
    yearSection: "BSED 4-2",
    email: "test@email.com",
    accessCode: "SIKHAY-PRETEST",
    startTime: "November 9, 2025, 01:00:00 PM",
    endTime: "November 9, 2025, 01:05:00 PM",
    score: 4,
    totalQuestions: 5,
    percentage: "80.0",
    answers: [
      {
        section: "PRETEST",
        questionNumber: 1,
        question: "Ano ang pangunahing layunin ng Aralin Panlipunan?",
        studentAnswer: "A. Pag-aaral ng kultura",
        correctAnswer: "A. Pag-aaral ng kultura",
        isCorrect: true,
        attempts: 1
      },
      {
        section: "PRETEST",
        questionNumber: 2,
        question: "Alin ang hindi kabilang sa Aralin?",
        studentAnswer: "B. Wrong answer",
        correctAnswer: "C. Correct answer",
        isCorrect: false,
        attempts: 2
      }
    ]
  };
  
  var timestamp = new Date();
  var url = createOrUpdateStudentPortfolio(testData, timestamp);
  Logger.log('Portfolio URL: ' + url);
}
```

### 4. Configure the Script

**CRITICAL STEP:**
1. In the Apps Script editor, find this line near the top:
   ```javascript
   var MAIN_FOLDER_ID = 'PASTE_YOUR_FOLDER_ID_HERE';
   ```
2. Replace `PASTE_YOUR_FOLDER_ID_HERE` with YOUR actual folder ID from Step 1
3. Example:
   ```javascript
   var MAIN_FOLDER_ID = '1ABC123xyzDEF456';
   ```
4. Click **Save** (disk icon)

### 5. Test the Script (Optional but Recommended)

1. In the Apps Script editor, find the `testPortfolio` function in the dropdown
2. Click **Run**
3. **First time only**: You'll need to authorize the script
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Your Project Name] (unsafe)**
   - Click **Allow**
4. Check your `Sikhay Responses` folder:
   - You should see a folder named **"BSED 4-2"**
   - Inside it, a document named **"test@email.com"**
5. If it worked, **delete the test folder** and proceed!

### 6. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Settings:
   - **Description**: "SIKHAY Portfolio System"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Web App URL**
   - It looks like: `https://script.google.com/macros/s/AKfycbz.../exec`

### 7. Update Your Quiz App

1. Open `script-new.js` in your project
2. Find this line:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace with your actual URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec';
   ```
4. Save the file

---

## How It Works

### First Submission - Juan from BSED 4-2

1. **Juan completes SIKHAY-PRETEST**
2. Script runs:
   - ✅ Creates folder: `Sikhay Responses/BSED 4-2/`
   - ✅ Creates document: `juan@email.com`
   - ✅ Adds student header and PRETEST results
   - ✅ Logs summary to Google Sheet with portfolio link

**Your Drive:**
```
📁 Sikhay Responses
  └── 📁 BSED 4-2
      └── 📄 juan@email.com (PRETEST results)
```

### Second Submission - Maria from BSED 4-2

1. **Maria completes SIKHAY-PRETEST**
2. Script runs:
   - ✅ Finds existing folder: `BSED 4-2`
   - ✅ Creates document: `maria@email.com`
   - ✅ Adds her PRETEST results

**Your Drive:**
```
📁 Sikhay Responses
  └── 📁 BSED 4-2
      ├── 📄 juan@email.com (PRETEST)
      └── 📄 maria@email.com (PRETEST)
```

### Third Submission - Juan Submits ACTIVITY

1. **Juan completes SIKHAY-ACTIVITY**
2. Script runs:
   - ✅ Finds folder: `BSED 4-2`
   - ✅ Finds his existing document: `juan@email.com`
   - ✅ **APPENDS** ACTIVITY results to the bottom
   - ✅ Document now contains: PRETEST + ACTIVITY

**Juan's Document Content:**
```
Juan Dela Cruz
Email: juan@email.com
Year & Section: BSED 4-2
---

SIKHAY-PRETEST (5/5 - 100%)
Submitted: November 9, 2025...
[PRETEST questions and answers]

---

SIKHAY-ACTIVITY (3/3 - 100%)
Submitted: November 9, 2025...
[ACTIVITY questions and answers]
```

---

## Final Result

After the entire semester, your Drive will be perfectly organized:

```
📁 Sikhay Responses
  │
  ├── 📁 BSED 4-1
  │   ├── 📄 ana@email.com (All her quizzes)
  │   ├── 📄 pedro@email.com (All his quizzes)
  │   └── 📄 rosa@email.com (All her quizzes)
  │
  ├── 📁 BSED 4-2
  │   ├── 📄 juan@email.com (PRETEST, ACTIVITY, ANALISIS, ABSTRACT, APPLICATION, POST-TEST)
  │   ├── 📄 maria@email.com (Complete portfolio)
  │   └── 📄 jose@email.com (Complete portfolio)
  │
  ├── 📁 BSED 4-3
  │   └── ... (Student portfolios)
  │
  ├── 📁 BSED 4-4
  │   └── ... (Student portfolios)
  │
  └── 📁 BSED 4-5
      └── ... (Student portfolios)
```

---

## Benefits

✅ **Zero Manual Work**: Everything auto-files itself
✅ **Student Progress Tracking**: See ALL attempts in one document
✅ **Class Organization**: Easy to find any student by class
✅ **Historical Record**: Complete portfolio for the entire semester
✅ **Easy Sharing**: Share individual portfolios with students
✅ **Quick Grading**: Summary sheet + detailed portfolios
✅ **Professional**: Clean, formatted Google Docs

---

## Using the Portfolios

### For Grading:
- Open a student's portfolio to see their complete quiz history
- Compare pre-test vs post-test improvement
- Identify struggling students by reviewing their attempts

### For Parent-Teacher Conferences:
- Share the student's portfolio link
- Show detailed progress over time
- Evidence of learning and improvement

### For Students:
- Share their own portfolio with them
- They can review their mistakes
- Track their own progress

---

## Troubleshooting

### "Reference error: MAIN_FOLDER_ID is not defined"
- You forgot to replace `PASTE_YOUR_FOLDER_ID_HERE` with your actual folder ID
- Go back to Step 4

### "Exception: You do not have permission to call DriveApp.getFolderById"
- The script needs authorization
- Run the `testPortfolio` function and authorize it (Step 5)

### "Files are not appearing in my Drive folder"
- Check that you copied the correct Folder ID
- Make sure the folder is shared with "Anyone with the link" as Editor
- Check the browser console (F12) for errors

### "Script is creating duplicates"
- This shouldn't happen - the script checks for existing files
- If it does, check that student emails are consistent (lowercase)

---

## Advanced Options

### Want email notifications when students submit?
Add this to the `doPost` function:
```javascript
MailApp.sendEmail({
  to: 'your-email@example.com',
  subject: 'New Quiz Submission: ' + data.name,
  body: 'Student: ' + data.name + '\nQuiz: ' + data.accessCode + '\nScore: ' + data.score + '/' + data.totalQuestions
});
```

### Want different folder structure?
Modify the `createOrUpdateStudentPortfolio` function to create additional subfolders

### Want to export portfolios as PDFs?
Each Google Doc has an export feature: File → Download → PDF

---

## Need Help?

1. Check the Apps Script execution log: **View** → **Executions**
2. Check your browser console: Press F12 → Console tab
3. Verify your folder ID is correct
4. Make sure folder permissions are set to "Editor"

---

**You're all set!** 🎉 Your quiz app now automatically creates and maintains student portfolios with zero manual work!
