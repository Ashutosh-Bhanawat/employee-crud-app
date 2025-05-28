import axios from 'axios';
import { useState, useEffect } from 'react';
import skillsData from '../data/skills.json';
import departmentsData from '../data/departments.json';
import gendersData from '../data/genders.json';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const initialState = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  skills: [],
  department: '',
  resume: null,
  profileImage: null,
  isActive: false,
  address: '',
};

const EmployeeProfileForm = () => {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);
  const [newGalleryImages, setNewGalleryImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  const formatDateForInput = (isoString) => isoString?.split('T')[0] ?? '';

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      axios.get(`http://localhost:3000/api/employees/${id}`)
        .then(res => {
          const data = res.data;
          setFormData({
            address: data.address || '',
            department: data.department || '',
            dob: formatDateForInput(data.dob),
            email: data.email || '',
            fullName: data.fullName || '',
            gender: data.gender || '',
            phone: data.phone || '',
            isActive: data.isActive || false,
            profileImage: null,
            resume: null,
            skills: data.skills || [],
          });
          setExistingGallery(data.galleryImages || []);
          setResumePreview(data.resume?.split('/').pop());
          setProfilePreview(data.profileImage);
        })
        .catch(err => {
          console.error('Error fetching employee data:', err);
          toast.error("Failed to load employee data");
        });
    }
  }, [id]);

  const handleRemoveExistingImage = (imagePath) => {
    setRemovedImages(prev => [...prev, imagePath]);
    setExistingGallery(prev => prev.filter(img => img !== imagePath));
  };

  const handleRemoveNewImage = (index) => {
    const updatedFiles = [...newGalleryImages];
    updatedFiles.splice(index, 1);
    setNewGalleryImages(updatedFiles);
  };

  const handleChange = (e) => {
    const { name, type, checked, files, value } = e.target;

    if (type === 'file') {
      if (name === 'galleryImages') {
        const fileArray = Array.from(files);
        if (fileArray.length > 10) {
          toast.error("You can upload a maximum of 10 gallery images.");
          return;
        }
        setGalleryImages(fileArray);
        setGalleryPreviews(fileArray.map(file => URL.createObjectURL(file)));
      } else {
        setFormData({ ...formData, [name]: files[0] });
        if (name === 'profileImage') {
          setProfilePreview(URL.createObjectURL(files[0]));
        }
        if (name === 'resume') {
          setResumePreview(files[0].name);
        }
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, opt => opt.value);
    setFormData({ ...formData, skills: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData();
    form.append('fullName', formData.fullName);
    form.append('email', formData.email);
    form.append('phone', formData.phone);
    form.append('dob', formData.dob);
    form.append('gender', formData.gender);
    formData.skills.forEach(skill => form.append('skills', skill));
    form.append('department', formData.department);
    form.append('address', formData.address);
    form.append('isActive', formData.isActive);

    if (isEditMode) {
      existingGallery.forEach(img => form.append('existingImages[]', img));
      removedImages.forEach(img => form.append('removedImages[]', img));
      newGalleryImages.forEach(file => form.append('newGalleryImages', file));
    } else {
      galleryImages.forEach(img => form.append('galleryImages', img));
    }

    if (formData.resume) form.append('resume', formData.resume);
    if (formData.profileImage) form.append('profileImage', formData.profileImage);

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:3000/api/employees/${id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Employee updated successfully!");
      } else {
        await axios.post("http://localhost:3000/api/employees", form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Employee profile created successfully!");
      }
      navigate('/employees');
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-8">
            <h2 className="text-4xl font-bold text-white text-center">
              {isEditMode ? "✏️ Edit Employee Profile" : "👤 Create Employee Profile"}
            </h2>
            <p className="text-blue-100 text-center mt-2 text-lg">
              {isEditMode ? "Update employee information" : "Add a new team member"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="text-blue-600 mr-3">👤</span>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-blue-300 group-hover:shadow-md"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-blue-300 group-hover:shadow-md"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="number" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-blue-300 group-hover:shadow-md"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-blue-300 group-hover:shadow-md"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                <div className="flex gap-6">
                  {gendersData.map((gender) => (
                    <label key={gender.value} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={gender.value} 
                        checked={formData.gender === gender.value} 
                        onChange={handleChange} 
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-700 group-hover:text-blue-600 transition-colors duration-200 font-medium">
                        {gender.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="text-green-600 mr-3">💼</span>
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                  <select 
                    multiple 
                    name="skills" 
                    value={formData.skills} 
                    onChange={handleMultiSelectChange} 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-40 focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-300 group-hover:shadow-md"
                  >
                    {skillsData.map(skill => (
                      <option key={skill.value} value={skill.value} className="py-2 hover:bg-green-100">
                        {skill.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <select 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-300 group-hover:shadow-md"
                  >
                    <option value="">Select Department</option>
                    {departmentsData.map(dep => (
                      <option key={dep.value} value={dep.value}>{dep.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* File Uploads Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="text-purple-600 mr-3">📁</span>
                File Uploads
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resume</label>
                  <input 
                    type="file" 
                    name="resume" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleChange} 
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:border-purple-300 group-hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {resumePreview && (
                    <div className="mt-4 p-4 bg-white border-2 border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center space-x-3">
                        <span className="text-4xl">📄</span>
                        <div>
                          <p className="font-medium text-gray-800">Resume Uploaded</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {resumePreview.length > 20 ? resumePreview.substring(0, 20) + '...' : resumePreview}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                  <input 
                    type="file" 
                    name="profileImage" 
                    accept="image/*" 
                    onChange={handleChange} 
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:border-purple-300 group-hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {profilePreview && (
                    <div className="mt-4 w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <img 
                        src={profilePreview.startsWith('blob:') ? profilePreview : `http://localhost:3000/uploads/${profilePreview}`} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="text-orange-600 mr-3">🖼️</span>
                Gallery Images {isEditMode && "(Update)"}
              </h3>

              {isEditMode ? (
                <div>
                  <input 
                    type="file" 
                    name="newGalleryImages" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => setNewGalleryImages(Array.from(e.target.files))} 
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-orange-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 mb-6"
                  />
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {/* Existing Images */}
                    {existingGallery.map((img, i) => (
                      <div key={`existing-${i}`} className="group relative">
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <img
                            src={`http://localhost:3000/uploads/${img}`}
                            alt={`Existing ${i}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-start justify-end p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(img)}
                              className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 transform hover:scale-110 shadow-lg"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-center mt-2 text-gray-600 font-medium">Existing</p>
                      </div>
                    ))}

                    {/* New Images */}
                    {newGalleryImages.map((file, i) => (
                      <div key={`new-${i}`} className="group relative">
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-green-300 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${i}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-start justify-end p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(i)}
                              className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 transform hover:scale-110 shadow-lg"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-center mt-2 text-green-600 font-medium">New</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <input 
                    type="file" 
                    name="galleryImages" 
                    accept="image/*" 
                    multiple 
                    onChange={handleChange} 
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-orange-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 mb-6"
                  />
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {galleryPreviews.map((src, i) => (
                      <div key={i} className="group">
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <img 
                            src={src} 
                            alt={`Gallery ${i}`} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information Section */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="text-cyan-600 mr-3">📋</span>
                Additional Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-cyan-200 hover:shadow-md transition-shadow duration-300">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      checked={formData.isActive} 
                      onChange={handleChange} 
                      className="w-6 h-6 text-cyan-600 border-2 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2 transition-all duration-200"
                    />
                    <span className="text-lg font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-200">
                      ✅ Active Employee
                    </span>
                  </label>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    rows={4} 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-cyan-500 focus:outline-none transition-all duration-300 hover:border-cyan-300 group-hover:shadow-md resize-none"
                    placeholder="Enter complete address..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isLoading} 
                className={`w-full py-4 px-8 rounded-2xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    {isEditMode ? "💾 Update Employee" : "✨ Create Employee"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileForm;
