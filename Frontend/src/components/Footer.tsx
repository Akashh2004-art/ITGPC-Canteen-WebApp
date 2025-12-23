import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="relative z-10 bg-slate-900 text-white py-8 mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* Left Section - About */}
                    <div>
                        <h3 className="text-xl font-bold text-primary mb-3">Canteen Management</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your one-stop solution for delicious meals and hassle-free ordering.
                            Experience the best of campus dining.
                        </p>
                        {/* ✅ College Info */}
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                                Itahar Government Polytechnic
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                Faculty & Staff Canteen Portal
                            </p>
                        </div>
                    </div>

                    {/* Middle Section - Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-3">Quick Links</h4>
                        <ul className="space-y-2">
                            {/* ✅ Dashboard */}
                            <li>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="text-gray-300 hover:text-primary transition-colors text-sm flex items-center gap-2 w-full text-left"
                                >
                                    <span className="material-symbols-outlined text-base">home</span>
                                    Dashboard
                                </button>
                            </li>
                            {/* ✅ Browse Menu */}
                            <li>
                                <button
                                    onClick={() => navigate('/menu')}
                                    className="text-gray-300 hover:text-primary transition-colors text-sm flex items-center gap-2 w-full text-left"
                                >
                                    <span className="material-symbols-outlined text-base">restaurant_menu</span>
                                    Browse Menu
                                </button>
                            </li>
                            {/* ✅ Track Order */}
                            <li>
                                <button
                                    onClick={() => navigate('/track-order')}
                                    className="text-gray-300 hover:text-primary transition-colors text-sm flex items-center gap-2 w-full text-left"
                                >
                                    <span className="material-symbols-outlined text-base">location_on</span>
                                    Track Orders
                                </button>
                            </li>
                            {/* ✅ Profile */}
                            <li>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="text-gray-300 hover:text-primary transition-colors text-sm flex items-center gap-2 w-full text-left"
                                >
                                    <span className="material-symbols-outlined text-base">account_circle</span>
                                    My Profile
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Right Section - Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-3">Contact Us</h4>
                        <ul className="space-y-2">
                            <li className="text-gray-300 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">phone</span>
                                +91 98765 43210
                            </li>
                            <li className="text-gray-300 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">email</span>
                                canteen@igp.edu.in
                            </li>
                            <li className="text-gray-300 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">location_on</span>
                                Itahar, West Bengal
                            </li>
                            <li className="text-gray-300 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">schedule</span>
                                Mon-Sat: 8AM - 8PM
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section - Copyright */}
                <div className="border-t border-slate-700 pt-6 mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-300 text-sm">
                            © 2024 IGP Canteen Management System. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            {/* ✅ Privacy & Terms (can add routes later) */}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                Terms of Service
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                Help & Support
                            </button>
                        </div>
                    </div>

                    {/* ✅ Developer Credit (Optional) */}
                    <div className="text-center mt-4 pt-4 border-t border-slate-700">
                        <p className="text-gray-400 text-xs">
                            Developed with ❤️ for Itahar Government Polytechnic
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;