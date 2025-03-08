import React, { useState, useRef } from 'react';
import { PlusCircle, Copy, Trash2, Settings, ChevronDown, Eye, Save, ArrowLeft, ArrowRight, Layers, ArrowUp, ArrowDown } from 'lucide-react';

// Field categories defined outside component
const fieldCategories = [
  { 
    name: "Patient Info", 
    fields: [
      { type: "patient-name", label: "Name" },
      { type: "patient-address", label: "Address" },
      { type: "patient-phone", label: "Phone Number" }
    ]
  },
  { 
    name: "Structure", 
    fields: [
      { type: "heading", label: "Heading" },
      { type: "paragraph", label: "Paragraph" }
    ]
  },
  { 
    name: "Text", 
    fields: [
      { type: "short-text", label: "Short Text" },
      { type: "long-text", label: "Long Text" },
      { type: "email", label: "Email" },
      { type: "number", label: "Number Input" }
    ]
  },
  { 
    name: "Date & Time", 
    fields: [
      { type: "date", label: "Date" },
      { type: "date-of-birth", label: "Date of Birth" }
    ]
  },
  { 
    name: "Upload", 
    fields: [
      { type: "file-upload", label: "File Upload" },
      { type: "image-upload", label: "Image Upload" },
      { type: "card-photo", label: "Card Photo (Front & Back)" },
      { type: "medications", label: "Medications List" },
      { type: "signature", label: "Signature" }
    ]
  },
  { 
    name: "Options", 
    fields: [
      { type: "checkboxes", label: "Checkboxes" },
      { type: "radio", label: "Radio Buttons" },
      { type: "dropdown", label: "Dropdown" },
      { type: "rating-scale", label: "Rating Scale" }
    ]
  }
];

const FormBuilder = () => {
  // Basic state
  const [activePage, setActivePage] = useState(0);
  const [showConditionalLogic, setShowConditionalLogic] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(fieldCategories.map(() => true));
  
  // Form structure state
  const [pages, setPages] = useState([
    { id: 1, name: "Personal Information" },
    { id: 2, name: "Medical History" },
    { id: 3, name: "Insurance Information" }
  ]);
  
  const [formFields, setFormFields] = useState([
    { id: 1, type: "patient-name", label: "Full Name", required: true },
    { id: 2, type: "email", label: "Email Address", required: true },
    { id: 3, type: "patient-phone", label: "Phone Number", required: true },
    { id: 4, type: "date-of-birth", label: "Date of Birth", required: true }
  ]);
  
  // Refs for generating IDs
  const nextFieldId = useRef(5);
  const nextPageId = useRef(4);
  
  // ========================
  // FIELD MANAGEMENT
  // ========================
  
  // Add a new field
  const handleAddField = (field) => {
    let newField = {
      id: nextFieldId.current++,
      type: field.type,
      label: field.label,
      required: false
    };
    
    // Add specific properties for certain field types
    if (field.type === 'rating-scale') {
      newField.questions = [
        { id: 1, text: "Question 1" },
        { id: 2, text: "Question 2" },
        { id: 3, text: "Question 3" }
      ];
      newField.nextQuestionId = 4;
    } else if (field.type === 'medications') {
      newField.medications = [
        { id: 1, name: "" }
      ];
      newField.nextMedicationId = 2;
    }
    
    setFormFields([...formFields, newField]);
  };
  
  // Move a field up
  const handleMoveFieldUp = (index) => {
    if (index === 0) return; // Already at top
    
    const newFields = [...formFields];
    const temp = newFields[index];
    newFields[index] = newFields[index - 1];
    newFields[index - 1] = temp;
    
    setFormFields(newFields);
  };
  
  // Move a field down
  const handleMoveFieldDown = (index) => {
    if (index === formFields.length - 1) return; // Already at bottom
    
    const newFields = [...formFields];
    const temp = newFields[index];
    newFields[index] = newFields[index + 1];
    newFields[index + 1] = temp;
    
    setFormFields(newFields);
  };
  
  // Delete a field
  const handleDeleteField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };
  
  // Duplicate a field
  const handleDuplicateField = (field) => {
    const newField = {
      ...field,
      id: nextFieldId.current++,
      label: `${field.label} (Copy)`
    };
    
    // Deep copy questions array for rating scale fields
    if (field.type === 'rating-scale' && field.questions) {
      newField.questions = JSON.parse(JSON.stringify(field.questions));
      newField.nextQuestionId = field.nextQuestionId;
    }
    
    // Deep copy medications array
    if (field.type === 'medications' && field.medications) {
      newField.medications = JSON.parse(JSON.stringify(field.medications));
      newField.nextMedicationId = field.nextMedicationId;
    }
    
    // Find the index of the field being duplicated
    const fieldIndex = formFields.findIndex(f => f.id === field.id);
    
    // Insert the duplicated field after the original
    const newFields = [...formFields];
    newFields.splice(fieldIndex + 1, 0, newField);
    
    setFormFields(newFields);
  };
  
  // Toggle field required status
  const handleToggleRequired = (index) => {
    const updatedFields = [...formFields];
    updatedFields[index].required = !updatedFields[index].required;
    setFormFields(updatedFields);
  };
  
  // Update field label
  const handleFieldLabelChange = (index, newLabel) => {
    const updatedFields = [...formFields];
    updatedFields[index].label = newLabel;
    setFormFields(updatedFields);
  };
  
  // Update a rating scale question text
  const handleRatingQuestionChange = (fieldIndex, questionId, newText) => {
    const updatedFields = [...formFields];
    const field = updatedFields[fieldIndex];
    
    if (field.questions) {
      const questionIndex = field.questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        field.questions[questionIndex].text = newText;
        setFormFields(updatedFields);
      }
    }
  };
  
  // Add a question to a rating scale
  const handleAddRatingQuestion = (e, fieldIndex) => {
    e.preventDefault();
    
    const updatedFields = [...formFields];
    const field = updatedFields[fieldIndex];
    
    if (!field.questions) {
      field.questions = [
        { id: 1, text: "Question 1" },
        { id: 2, text: "Question 2" },
        { id: 3, text: "Question 3" }
      ];
      field.nextQuestionId = 4;
    } else {
      const newId = field.nextQuestionId || field.questions.length + 1;
      field.questions.push({
        id: newId,
        text: `Question ${newId}`
      });
      field.nextQuestionId = newId + 1;
    }
    
    setFormFields(updatedFields);
  };
  
  // Remove a question from a rating scale
  const handleRemoveRatingQuestion = (e, fieldIndex, questionId) => {
    e.preventDefault();
    
    const updatedFields = [...formFields];
    const field = updatedFields[fieldIndex];
    
    if (field.questions && field.questions.length > 1) {
      field.questions = field.questions.filter(q => q.id !== questionId);
      setFormFields(updatedFields);
    }
  };
  
  // Add a medication to a medications list
  const handleAddMedication = (e, fieldIndex) => {
    e.preventDefault();
    
    const updatedFields = [...formFields];
    const field = updatedFields[fieldIndex];
    
    if (!field.medications) {
      field.medications = [{ id: 1, name: "" }];
      field.nextMedicationId = 2;
    } else {
      const newId = field.nextMedicationId || field.medications.length + 1;
      field.medications.push({
        id: newId,
        name: ""
      });
      field.nextMedicationId = newId + 1;
    }
    
    setFormFields(updatedFields);
  };
  
  // Remove a medication from a medications list
  const handleRemoveMedication = (e, fieldIndex, medicationId) => {
    e.preventDefault();
    
    const updatedFields = [...formFields];
    const field = updatedFields[fieldIndex];
    
    if (field.medications && field.medications.length > 1) {
      field.medications = field.medications.filter(m => m.id !== medicationId);
      setFormFields(updatedFields);
    }
  };
  
  // Update a medication name
  const handleMedicationChange = (fieldIndex, medicationId, newName) => {
    const updatedFields = [...formFields];
    const field = updatedFields[fieldIndex];
    
    if (field.medications) {
      const medicationIndex = field.medications.findIndex(m => m.id === medicationId);
      if (medicationIndex !== -1) {
        field.medications[medicationIndex].name = newName;
        setFormFields(updatedFields);
      }
    }
  };
  
  // ========================
  // PAGE MANAGEMENT
  // ========================
  
  // Add a new page
  const handleAddPage = () => {
    const newPage = {
      id: nextPageId.current++,
      name: `New Page ${nextPageId.current - 3}`
    };
    
    setPages([...pages, newPage]);
    setActivePage(pages.length); // Switch to the new page
  };
  
  // Delete a page
  const handleDeletePage = (pageId) => {
    if (pages.length <= 1) return; // Don't delete the last page
    
    const pageIndex = pages.findIndex(page => page.id === pageId);
    const newPages = pages.filter(page => page.id !== pageId);
    
    setPages(newPages);
    
    // Adjust active page if needed
    if (activePage >= newPages.length) {
      setActivePage(newPages.length - 1);
    } else if (activePage === pageIndex) {
      setActivePage(Math.max(0, activePage - 1));
    }
  };
  
  // Duplicate a page
  const handleDuplicatePage = (pageId) => {
    const pageToDuplicate = pages.find(page => page.id === pageId);
    if (!pageToDuplicate) return;
    
    const newPage = {
      id: nextPageId.current++,
      name: `${pageToDuplicate.name} (Copy)`
    };
    
    // Insert after the original page
    const pageIndex = pages.findIndex(page => page.id === pageId);
    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, newPage);
    
    setPages(newPages);
    setActivePage(pageIndex + 1); // Switch to the new page
  };
  
  // Handle page name edit
  const handleEditPageName = (pageId) => {
    setEditingPageId(pageId);
  };
  
  // Handle page name change
  const handlePageNameChange = (e, pageId) => {
    const newPages = pages.map(page => 
      page.id === pageId ? { ...page, name: e.target.value } : page
    );
    setPages(newPages);
  };
  
  // Handle page name edit complete
  const handlePageNameEditComplete = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      setEditingPageId(null);
    }
  };
  
  // Toggle category expanded state
  const handleToggleCategory = (index) => {
    const newExpandedCategories = [...expandedCategories];
    newExpandedCategories[index] = !newExpandedCategories[index];
    setExpandedCategories(newExpandedCategories);
  };
  
  // Render field based on type
  const renderFieldPreview = (field, index) => {
    switch(field.type) {
      case 'patient-name':
        return (
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            placeholder="Enter full name"
            disabled
          />
        );
        
      case 'patient-address':
        return (
          <div className="space-y-2">
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Street Address"
              disabled
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                className="p-2 border border-gray-300 rounded-md"
                placeholder="City"
                disabled
              />
              <input 
                type="text" 
                className="p-2 border border-gray-300 rounded-md"
                placeholder="State/Province"
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                className="p-2 border border-gray-300 rounded-md"
                placeholder="ZIP/Postal Code"
                disabled
              />
              <input 
                type="text" 
                className="p-2 border border-gray-300 rounded-md"
                placeholder="Country"
                disabled
              />
            </div>
          </div>
        );
        
      case 'patient-phone':
        return (
          <input 
            type="tel" 
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="(000) 000-0000"
            disabled
          />
        );
        
      case 'email':
        return (
          <input 
            type="email" 
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="name@example.com"
            disabled
          />
        );
        
      case 'short-text':
        return (
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Short answer text"
            disabled
          />
        );
        
      case 'long-text':
        return (
          <textarea 
            className="w-full p-2 border border-gray-300 rounded-md h-24"
            placeholder="Long answer text..."
            disabled
          />
        );
        
      case 'number':
        return (
          <input 
            type="number" 
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="0"
            disabled
          />
        );
        
      case 'heading':
        return (
          <div className="py-2">
            <h3 contentEditable="true" suppressContentEditableWarning={true} className="text-xl font-medium border-b border-gray-200 pb-2">
              Section Heading
            </h3>
          </div>
        );
        
      case 'paragraph':
        return (
          <div className="py-2">
            <p contentEditable="true" suppressContentEditableWarning={true} className="text-gray-600">
              Add informational text or instructions for patients here. This text helps guide patients through the form.
            </p>
          </div>
        );
        
      case 'submit-button':
        return (
          <button 
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            disabled
          >
            Submit Form
          </button>
        );
        
      case 'date':
        return (
          <input 
            type="date" 
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled
          />
        );
        
      case 'date-of-birth':
        return (
          <div className="grid grid-cols-3 gap-2">
            <select className="p-2 border border-gray-300 rounded-md" disabled>
              <option>Month</option>
            </select>
            <select className="p-2 border border-gray-300 rounded-md" disabled>
              <option>Day</option>
            </select>
            <select className="p-2 border border-gray-300 rounded-md" disabled>
              <option>Year</option>
            </select>
          </div>
        );
        
      case 'dropdown':
        return (
          <select className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200" disabled>
            <option value="">Select an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        );
        
      case 'file-upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <p className="text-gray-500 mb-2">Drag and drop file here</p>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded" disabled>
              Browse Files
            </button>
          </div>
        );
        
      case 'image-upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <p className="text-gray-500 mb-2">Upload an image</p>
            <div className="flex justify-center">
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded" disabled>
                Choose Image
              </button>
            </div>
          </div>
        );
        
      case 'card-photo':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <div className="text-gray-500 mb-2 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Card Front</span>
                  <span className="text-xs">Take a photo or upload</span>
                </div>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded" disabled>
                  Upload
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <div className="text-gray-500 mb-2 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Card Back</span>
                  <span className="text-xs">Take a photo or upload</span>
                </div>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded" disabled>
                  Upload
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">Please upload clear images of both sides of the card</p>
          </div>
        );
        
      case 'medications':
        if (!field.medications) {
          const updatedFields = [...formFields];
          updatedFields[index].medications = [{ id: 1, name: "" }];
          updatedFields[index].nextMedicationId = 2;
          setTimeout(() => setFormFields(updatedFields), 0);
          return <div>Loading medications list...</div>;
        }
        
        return (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Current Medications</div>
            
            {field.medications.map((medication) => (
              <div key={medication.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter medication name, dosage, and frequency"
                  value={medication.name}
                  onChange={(e) => handleMedicationChange(index, medication.id, e.target.value)}
                />
                {field.medications.length > 1 && (
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-red-600 focus:outline-none"
                    onClick={(e) => handleRemoveMedication(e, index, medication.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 focus:outline-none"
              onClick={(e) => handleAddMedication(e, index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Add Medication
            </button>
          </div>
        );
        
      case 'signature':
        return (
          <div className="border border-gray-300 rounded-md p-4 h-32 bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">Click here to sign</p>
          </div>
        );
        
      case 'checkboxes':
        return (
          <div className="space-y-2">
            {[1, 2, 3].map(num => (
              <div key={num} className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-gray-700">Option {num}</span>
              </div>
            ))}
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {[1, 2, 3].map(num => (
              <div key={num} className="flex items-center">
                <input type="radio" name="radioGroup" className="mr-2" disabled />
                <span className="text-gray-700">Option {num}</span>
              </div>
            ))}
          </div>
        );
        
      case 'rating-scale':
        if (!field.questions) {
          const updatedFields = [...formFields];
          updatedFields[index].questions = [
            { id: 1, text: "Question 1" },
            { id: 2, text: "Question 2" },
            { id: 3, text: "Question 3" }
          ];
          updatedFields[index].nextQuestionId = 4;
          setTimeout(() => setFormFields(updatedFields), 0);
          return <div>Loading rating scale...</div>;
        }
        
        return (
          <div className="space-y-6">
            <div className="text-sm font-medium text-gray-700">Rating Scale</div>
            
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-1"></div>
              <div className="col-span-1 text-center text-sm text-gray-600">Very Unsatisfied</div>
              <div className="col-span-1 text-center text-sm text-gray-600">Unsatisfied</div>
              <div className="col-span-1 text-center text-sm text-gray-600">Neutral</div>
              <div className="col-span-1 text-center text-sm text-gray-600">Satisfied</div>
              <div className="col-span-1 text-center text-sm text-gray-600">Very Satisfied</div>
              
              {field.questions.map((question) => (
                <React.Fragment key={question.id}>
                  <div className="col-span-1 flex items-center">
                    <input 
                      type="text" 
                      className="w-full text-sm text-gray-700 border-none p-0 focus:outline-none focus:ring-0 bg-transparent"
                      value={question.text}
                      onChange={(e) => handleRatingQuestionChange(index, question.id, e.target.value)}
                    />
                    {field.questions.length > 1 && (
                      <button 
                        type="button"
                        className="ml-1 text-gray-400 hover:text-red-600 focus:outline-none"
                        onClick={(e) => handleRemoveRatingQuestion(e, index, question.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      </button>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center"><input type="radio" name={`q${question.id}_${field.id}`} disabled /></div>
                  <div className="col-span-1 flex justify-center"><input type="radio" name={`q${question.id}_${field.id}`} disabled /></div>
                  <div className="col-span-1 flex justify-center"><input type="radio" name={`q${question.id}_${field.id}`} disabled /></div>
                  <div className="col-span-1 flex justify-center"><input type="radio" name={`q${question.id}_${field.id}`} disabled /></div>
                  <div className="col-span-1 flex justify-center"><input type="radio" name={`q${question.id}_${field.id}`} disabled /></div>
                </React.Fragment>
              ))}
            </div>
            
            <button 
              type="button"
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 focus:outline-none"
              onClick={(e) => handleAddRatingQuestion(e, index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Add Question
            </button>
          </div>
        );
        
      default:
        return <div className="text-gray-500">Field preview not available</div>;
    }
  };
  
  // Main render function
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-purple-600 rounded-md"></div>
            <h1 className="text-xl font-medium">MedForm Builder</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-md">
              <Save className="w-4 h-4 mr-2" />
              Save Form
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Field Categories */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-sm font-medium text-gray-500 mb-3">FORM ELEMENTS</h2>
            {fieldCategories.map((category, index) => (
              <div key={index} className="mb-4">
                <div 
                  className="flex items-center justify-between mb-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                  onClick={() => handleToggleCategory(index)}
                >
                  <h3 className="text-sm font-medium text-gray-700">{category.name}</h3>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories[index] ? '' : 'transform -rotate-90'}`} />
                </div>
                {expandedCategories[index] && (
                  <div className="space-y-2">
                    {category.fields.map((field, fieldIndex) => (
                      <div 
                        key={fieldIndex}
                        className="flex items-center p-2 bg-white border border-gray-200 rounded-md hover:border-purple-300 hover:shadow-sm cursor-pointer transition-colors"
                        onClick={() => handleAddField(field)}
                      >
                        <PlusCircle className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{field.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Page Navigator */}
          <div className="border-t border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">PAGES</h2>
            <div className="space-y-2">
              {pages.map((page, index) => (
                <div 
                  key={page.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    activePage === index ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-white border-gray-200'
                  } border`}
                  onClick={() => setActivePage(index)}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  {editingPageId === page.id ? (
                    <input
                      type="text"
                      className="text-sm flex-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                      value={page.name}
                      onChange={(e) => handlePageNameChange(e, page.id)}
                      onKeyDown={handlePageNameEditComplete}
                      onBlur={handlePageNameEditComplete}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="text-sm flex-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleEditPageName(page.id);
                      }}
                    >
                      {page.name}
                    </span>
                  )}
                  <div className="flex space-x-1">
                    <Copy 
                      className="w-4 h-4 text-gray-400 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePage(page.id);
                      }}
                    />
                    <Trash2 
                      className={`w-4 h-4 ${pages.length > 1 ? 'text-gray-400 hover:text-red-600' : 'text-gray-300'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pages.length > 1) {
                          handleDeletePage(page.id);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
              <button 
                className="flex items-center justify-center w-full p-2 text-sm text-purple-600 border border-dashed border-gray-300 rounded-md hover:border-purple-300"
                onClick={handleAddPage}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add New Page
              </button>
            </div>
          </div>
        </div>
        
        {/* Form Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Form title */}
              <div className="p-6 border-b border-gray-200">
                <input 
                  type="text" 
                  className="text-2xl font-medium w-full border-none focus:outline-none focus:ring-0" 
                  value={pages[activePage].name}
                  onChange={() => {}}
                  placeholder="Form Title"
                />
                <input 
                  type="text" 
                  className="text-gray-500 w-full border-none focus:outline-none focus:ring-0 mt-2" 
                  placeholder="Add a description"
                />
              </div>
              
              {/* Form fields */}
              <div className="p-6">
                <div className="space-y-4">
                  {formFields.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                      <div className="text-gray-500">
                        <p>Click on form elements in the sidebar to add them to your form</p>
                      </div>
                    </div>
                  ) : (
                    formFields.map((field, index) => (
                      <div 
                        key={field.id}
                        className="border rounded-md p-4 relative group hover:border-purple-300 hover:shadow-sm"
                      >
                        {/* Field actions */}
                        <div className="absolute -right-10 top-0 bottom-0 flex flex-col justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1 bg-white border border-gray-300 rounded-full shadow-sm text-gray-500 hover:text-purple-600 disabled:text-gray-300"
                            onClick={() => handleMoveFieldUp(index)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          
                          <button 
                            className="p-1 bg-white border border-gray-300 rounded-full shadow-sm text-gray-500 hover:text-purple-600 disabled:text-gray-300"
                            onClick={() => handleMoveFieldDown(index)}
                            disabled={index === formFields.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Field header */}
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <input 
                              type="text" 
                              className="font-medium text-gray-800 border-none p-0 focus:outline-none focus:ring-0"
                              value={field.label}
                              onChange={(e) => handleFieldLabelChange(index, e.target.value)}
                            />
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              className="text-gray-400 hover:text-purple-600"
                              onClick={() => setShowConditionalLogic(true)}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-purple-600"
                              onClick={() => handleDuplicateField(field)}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-red-600"
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Required toggle */}
                        <div className="mb-3 flex items-center">
                          <label className="flex items-center cursor-pointer">
                            <div 
                              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${field.required ? 'bg-purple-600' : 'bg-gray-300'}`}
                              onClick={() => handleToggleRequired(index)}
                            >
                              <div 
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ease-in-out ${field.required ? 'translate-x-5' : 'translate-x-0'}`}
                              />
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Required</span>
                          </label>
                        </div>
                        
                        {/* Field preview */}
                        {renderFieldPreview(field, index)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Form navigation */}
            <div className="flex justify-between mt-6">
              <button 
                className={`flex items-center px-4 py-2 rounded-md text-sm ${
                  activePage > 0 ? 'bg-white border border-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={activePage === 0}
                onClick={() => setActivePage(prev => Math.max(0, prev - 1))}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Page
              </button>
              <button 
                className={`flex items-center px-4 py-2 rounded-md text-sm ${
                  activePage < pages.length - 1 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={activePage === pages.length - 1}
                onClick={() => setActivePage(prev => Math.min(pages.length - 1, prev + 1))}
              >
                Next Page
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Conditional Logic Panel */}
        {showConditionalLogic && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-medium">Conditional Logic</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowConditionalLogic(false)}
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show this field if:
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200">
                  <option>All conditions are met</option>
                  <option>Any condition is met</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 border border-gray-200 rounded-md">
                  <div className="flex space-x-2 mb-2">
                    <select className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200">
                      <option>Insurance Type</option>
                      <option>Symptoms</option>
                      <option>Previous Visit</option>
                    </select>
                    <select className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200">
                      <option>is</option>
                      <option>is not</option>
                      <option>contains</option>
                    </select>
                  </div>
                  <select className="w-full p-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200">
                    <option>Medicare</option>
                    <option>Medicaid</option>
                    <option>Private Insurance</option>
                    <option>Self Pay</option>
                  </select>
                  <button className="mt-2 text-red-600 text-sm hover:text-red-800">
                    Remove
                  </button>
                </div>
              </div>
              
              <button className="mt-4 text-purple-600 text-sm inline-flex items-center hover:text-purple-800">
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Condition
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
