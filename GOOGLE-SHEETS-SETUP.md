# Google Sheets Integration Setup Guide

## Step-by-Step Instructions:

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "SIKHAY Quiz Responses" (or any name you prefer)
4. **Create TWO sheets** (tabs at the bottom):
   - Rename Sheet1 to: **"Summary"**
   - Create a new sheet and name it: **"Detailed Responses"**

5. **In the "Summary" sheet**, create these column headers in Row 1:
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

6. **In the "Detailed Responses" sheet**, create these column headers in Row 1:
   - A1: Timestamp
   - B1: Full Name
   - C1: Email
   - D1: Year & Section
   - E1: Access Code
   - F1: Question Number
   - G1: Section
   - H1: Question Text
   - I1: Student Answer
   - J1: Correct Answer
   - K1: Is Correct?
   - L1: Attempts

### 2. Create Google Apps Script

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any code in the editor
3. Copy and paste the following code:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    
    // Get or create the Summary sheet
    var summarySheet = spreadsheet.getSheetByName('Summary');
    if (!summarySheet) {
      summarySheet = spreadsheet.insertSheet('Summary');
      // Add headers
      summarySheet.appendRow([
        'Timestamp', 'Full Name', 'Year & Section', 'Email', 'Access Code',
        'Start Time', 'End Time', 'Score', 'Total Questions', 'Percentage'
      ]);
    }
    
    // Get or create the Detailed Responses sheet
    var detailedSheet = spreadsheet.getSheetByName('Detailed Responses');
    if (!detailedSheet) {
      detailedSheet = spreadsheet.insertSheet('Detailed Responses');
      // Add headers
      detailedSheet.appendRow([
        'Timestamp', 'Full Name', 'Email', 'Year & Section', 'Access Code',
        'Question Number', 'Section', 'Question Text', 'Student Answer',
        'Correct Answer', 'Is Correct?', 'Attempts'
      ]);
    }
    
    var timestamp = new Date();
    
    // Add summary row
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
      data.percentage + '%'
    ];
    summarySheet.appendRow(summaryRow);
    
    // Add detailed answer rows
    data.answers.forEach(function(answer) {
      var detailedRow = [
        timestamp,
        data.name,
        data.email,
        data.yearSection,
        data.accessCode,
        answer.questionNumber,
        answer.section,
        answer.question,
        answer.studentAnswer,
        answer.correctAnswer,
        answer.isCorrect ? 'YES' : 'NO',
        answer.attempts
      ];
      detailedSheet.appendRow(detailedRow);
    });
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'summaryRow': summarySheet.getLastRow(),
      'detailedRows': data.answers.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (optional - you can run this to test)
function test() {
  var testData = {
    name: "Test Student",
    yearSection: "4th Year - A",
    email: "test@email.com",
    accessCode: "SIKHAY-PRETEST",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    Puntos4,
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
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

### 3. Deploy as Web App

1. Click the **Deploy** button (top right) > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in the settings:
   - **Description**: "SIKHAY Quiz Data Collector" (or any description)
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **IMPORTANT**: Copy the **Web app URL** that appears
   - It will look like: `https://script.google.com/macros/s/AKfycbz.../exec`

### 4. Update Your Quiz App

1. Open `script-new.js` in your project
2. Find this line:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace it with your actual Web App URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```
4. Save the file

### 5. Test the Integration

1. Open your quiz application
2. Fill in the student information
3. Complete a quiz
4. Check your Google Sheet - you should see a new row with the student's data!

## Troubleshooting:

### If data is not appearing in Google Sheets:

1. **Check the URL**: Make sure you copied the full Web App URL
2. **Check permissions**: Make sure you set "Who has access" to "Anyone"
3. **Check the console**: Open browser DevTools (F12) and check for errors
4. **Re-deploy**: In Apps Script, create a new deployment if the old one isn't working

### Common Issues:

- **"Authorization required"**: You need to authorize the script
  - Click the Deploy button again
  - Click "Authorize access"
  - Sign in and allow permissions

- **Data not saving**: Check that your sheet has the correct column headers

## Data Structure in Google Sheets:

### Summary Sheet:
Each quiz submission creates **one row** with:
- Timestamp of submission
- Student's full information (name, email, year/section)
- Access code used
- Start and end times
- Overall score, total questions, and percentage

**Example:**
```
Timestamp        | Name         | Year/Section | Email           | Access Code    | Score | Total | %
Nov 9, 10:30 AM | Juan Dela C. | 4th Year - A | juan@email.com | SIKHAY-PRETEST | 4     | 5     | 80%
```

### Detailed Responses Sheet:
Each quiz submission creates **multiple rows** (one per question):
- Student information repeated for each answer
- Question-specific details
- Student's answer vs correct answer
- Whether it was correct
- Number of attempts

**Example:**
```
Name    | Email          | Code           | Q# | Section  | Question           | Student Ans | Correct Ans | Correct? | Attempts
Juan... | juan@email.com | SIKHAY-PRETEST | 1  | PRETEST | Ano ang layunin... | A. Culture  | A. Culture  | YES      | 1
Juan... | juan@email.com | SIKHAY-PRETEST | 2  | PRETEST | Alin ang hindi...  | B. Wrong    | C. Right    | NO       | 3
```

### Benefits:
- ✅ **Summary Sheet**: Quick overview, easy grading, export grades
- ✅ **Detailed Sheet**: Deep analysis, identify difficult questions, track learning patterns
- ✅ **Filter & Sort**: By student, date, access code, section
- ✅ **Analytics**: Create pivot tables, charts, and reports
- ✅ **Compare**: Pre-test vs post-test performance

## Advanced: Separate Sheet for Each Section

If you want even more organization, you can modify the Apps Script to:
1. Create separate sheets for each ACCESS CODE (PRETEST, ACTIVITY, etc.)
2. Add conditional formatting (color-code correct/incorrect answers)
3. Generate automatic analytics and grade reports
4. Send email notifications when students complete quizzes

**Want me to create this advanced version?** Let me know!

## Using the Data:

### For Grading:
- Use the **Summary** sheet to export final grades
- Sort by percentage to identify top/struggling students
- Filter by access code to grade specific sections

### For Analysis:
- Use the **Detailed Responses** sheet to:
  - Find which questions most students get wrong
  - Identify common misconceptions
  - Track improvement from pre-test to post-test
  - Analyze performance by section

### Create Reports:
1. **Pivot Tables**: Summarize performance by section, question, or student
2. **Charts**: Visualize score distribution, question difficulty
3. **Conditional Formatting**: Highlight scores below 60%, questions with <50% correct rate

## Security Note:

The Web App URL is public but only sends data one way (to your sheet). Students cannot:
- View other students' data
- Modify the spreadsheet
- Access your Google account

Only YOU can see the responses in your Google Sheet.
