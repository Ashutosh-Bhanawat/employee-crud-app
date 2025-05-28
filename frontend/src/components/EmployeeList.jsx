
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Lodding";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = () => {
        setLoading(true);
        axios.get("http://localhost:3000/api/employees")
            .then((response) => {
                setEmployees(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching employees:", error);
                setLoading(false);
            });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this action!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:3000/api/employees/${id}`);
            await fetchEmployees();
            Swal.fire('Deleted!', 'The employee profile has been deleted.', 'success');
        } catch (error) {
            console.error("Error deleting employee:", error);
            Swal.fire('Error!', 'Failed to delete the employee. Please try again.', 'error');
        }
    };

    const handleEdit = (id) => {
        navigate(`/edit-employee/${id}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <Loading />
                <p className="text-gray-600 mt-4 text-lg">Loading employees...</p>
            </div>
        </div>
    );

    if (!Array.isArray(employees) || employees.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Employees Found</h3>
                    <p className="text-gray-600">Start by adding your first team member!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-8">
                        <h1 className="text-4xl font-bold text-white text-center">
                            👥 Our Amazing Team
                        </h1>
                        <p className="text-blue-100 text-center mt-2 text-lg">
                            Meet our talented employees
                        </p>
                        <div className="text-center mt-4">
                            <span className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-full text-lg font-semibold">
                                {employees.length} Team Members
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {employees.map((emp) => {
                        const skillsToShow = emp.skills?.slice(0, 3) || [];
                        const remainingSkillCount = emp.skills?.length > 3 ? emp.skills.length - 3 : 0;

                        return (
                            <div
                                key={emp._id}
                                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 flex flex-col items-center border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 group"
                            >
                                {/* Profile Image */}
                                <div className="relative mb-6">
                                    <img
                                        src={
                                            emp.profileImage
                                                ? `http://localhost:3000/uploads/${emp.profileImage}`
                                                : "http://localhost:3000/uploads/default-profile.png"
                                        }
                                        alt={emp.fullName || "No Profile"}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "http://localhost:3000/uploads/no-profile.jpeg";
                                        }}
                                        className="w-32 h-32 object-cover rounded-full shadow-lg border-4 border-gradient-to-r from-blue-200 to-purple-200 group-hover:border-blue-300 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                </div>

                                {/* Employee Info */}
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                                        {emp.fullName}
                                    </h2>
                                    <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                        {emp.department}
                                    </p>
                                </div>

                                {/* Contact Info */}
                                <div className="w-full bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-600 flex items-center">
                                            📧 <span className="ml-1">Email:</span>
                                        </span>
                                        <span className="text-gray-800 font-medium truncate ml-2 max-w-32">
                                            {emp.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-600 flex items-center">
                                            📱 <span className="ml-1">Phone:</span>
                                        </span>
                                        <span className="text-gray-800 font-medium">
                                            {emp.phone}
                                        </span>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="w-full mb-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        🎯 <span className="ml-1">Skills</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {skillsToShow.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:from-blue-200 hover:to-purple-200 transition-all duration-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {remainingSkillCount > 0 && (
                                            <span className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                                                +{remainingSkillCount} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="w-full space-y-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(emp._id)}
                                            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white py-2 px-4 rounded-xl transition-all duration-300 font-medium hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                                        >
                                            ✏️ <span className="ml-1">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp._id)}
                                            className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-2 px-4 rounded-xl transition-all duration-300 font-medium hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                                        >
                                            🗑️ <span className="ml-1">Delete</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/gallery/${emp._id}`)}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 px-4 rounded-xl transition-all duration-300 font-medium hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                                    >
                                        🖼️ <span className="ml-1">Gallery</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EmployeeList;
