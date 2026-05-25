import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/Signup';
import { ProtectedRoute } from './ProtectedRoute';
import NotFound from './pages/blank/NotFound';

// Dashboard
import Home from './pages/home/Home';
import Blank from './pages/blank/Blank';

// Master
import IndexPlantSubSection from './pages/master/plantSubSection/IndexPlantSubSection';
import IndexBrandDevice from './pages/master/brandDevice/IndexBrandDevice';
import IndexDevice from './pages/master/device/IndexDevice';
import IndexUnit from './pages/master/unit/IndexUnit';
import IndexTag from './pages/master/tag/IndexTag';
import IndexStatus from './pages/master/status/IndexStatus';
import IndexSparepart from './pages/master/sparepart/IndexSparepart';
import IndexShift from './pages/master/shift/IndexShift';
// Brand device
import AddBrandDevice from './pages/master/brandDevice/AddBrandDevice';
import EditBrandDevice from './pages/master/brandDevice/EditBrandDevice';
import ViewBrandDevice from './pages/master/brandDevice/ViewBrandDevice';
import ViewFilePage from './pages/master/brandDevice/ViewFilePage';

// Jadwal Shift
import IndexJadwalShift from './pages/jadwalShift/IndexJadwalShift';

// History
import IndexTrending from './pages/report/trending/IndexTrending';
import IndexReport from './pages/report/report/IndexReport';

// Other Pages
import IndexNotification from './pages/notification/IndexNotification';
import IndexRole from './pages/role/IndexRole';
import IndexUser from './pages/user/IndexUser';
import IndexContact from './pages/contact/IndexContact';
import DetailNotificationTab from './pages/notificationDetail/IndexNotificationDetail';
import IndexVerificationSparepart from './pages/verificationSparepart/IndexVerificationSparepart';

import SvgTest from './pages/home/SvgTest';
import SvgOverviewCompressor from './pages/home/SvgOverviewCompressor';
import SvgCompressorA from './pages/home/SvgCompressorA';
import SvgCompressorB from './pages/home/SvgCompressorB';
import SvgCompressorC from './pages/home/SvgCompressorC';
import SvgOverviewAirDryer from './pages/home/SvgOverviewAirDryer';
import SvgAirDryerA from './pages/home/SvgAirDryerA';
import SvgAirDryerB from './pages/home/SvgAirDryerB';
import SvgAirDryerC from './pages/home/SvgAirDryerC';
import IndexHistoryAlarm from './pages/history/alarm/IndexHistoryAlarm';
import IndexHistoryEvent from './pages/history/event/IndexHistoryEvent';

// Image Viewer
import ImageViewer from './Utils/ImageViewer';
import RedirectWa from './pages/blank/RedirectWa';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/signin" replace />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/svg" element={<SvgTest />} />
                <Route
                    path="/notification-detail/:notificationId"
                    element={<DetailNotificationTab />}
                />
                <Route
                    path="/verification-sparepart/:notificationId"
                    element={<IndexVerificationSparepart />}
                />

                <Route path="/redirect" element={<RedirectWa />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute />}>
                    <Route path="home" element={<Home />} />
                    <Route path="blank" element={<Blank />} />
                </Route>

                <Route path="/image-viewer/:fileName" element={<ImageViewer />} />

                <Route path="/dashboard-svg" element={<ProtectedRoute />}>
                    <Route path="overview-compressor" element={<SvgOverviewCompressor />} />
                    <Route path="compressor-a" element={<SvgCompressorA />} />
                    <Route path="compressor-b" element={<SvgCompressorB />} />
                    <Route path="compressor-c" element={<SvgCompressorC />} />
                    <Route path="overview-airdryer" element={<SvgOverviewAirDryer />} />
                    <Route path="airdryer-a" element={<SvgAirDryerA />} />
                    <Route path="airdryer-b" element={<SvgAirDryerB />} />
                    <Route path="airdryer-c" element={<SvgAirDryerC />} />
                </Route>

                <Route path="/master" element={<ProtectedRoute />}>
                    <Route path="device" element={<IndexDevice />} />
                    <Route path="tag" element={<IndexTag />} />
                    <Route path="unit" element={<IndexUnit />} />
                    <Route path="sparepart" element={<IndexSparepart />} />
                    <Route path="plant-sub-section" element={<IndexPlantSubSection />} />
                    <Route path="shift" element={<IndexShift />} />
                    <Route path="status" element={<IndexStatus />} />

                    {/* Brand Device Routes */}
                    <Route path="brand-device" element={<IndexBrandDevice />} />
                    <Route path="brand-device/add" element={<AddBrandDevice />} />
                    <Route path="brand-device/edit/:id" element={<EditBrandDevice />} />
                    <Route path="brand-device/view/:id" element={<ViewBrandDevice />} />
                    <Route
                        path="brand-device/edit/:id/files/:fileType/:fileName"
                        element={<ViewFilePage />}
                    />
                    <Route
                        path="brand-device/view/:id/files/:fileType/:fileName"
                        element={<ViewFilePage />}
                    />
                    <Route
                        path="brand-device/view/temp/files/:fileName"
                        element={<ViewFilePage />}
                    />
                </Route>

                <Route path="/report" element={<ProtectedRoute />}>
                    <Route path="trending" element={<IndexTrending />} />
                    <Route path="report" element={<IndexReport />} />
                </Route>

                <Route path="/history" element={<ProtectedRoute />}>
                    <Route path="alarm" element={<IndexHistoryAlarm />} />
                    <Route path="event" element={<IndexHistoryEvent />} />
                </Route>

                <Route path="/notification" element={<ProtectedRoute />}>
                    <Route index element={<IndexNotification />} />
                </Route>

                <Route path="/role" element={<ProtectedRoute />}>
                    <Route index element={<IndexRole />} />
                </Route>

                <Route path="/user" element={<ProtectedRoute />}>
                    <Route index element={<IndexUser />} />
                </Route>

                <Route path="/contact" element={<ProtectedRoute />}>
                    <Route index element={<IndexContact />} />
                </Route>

                <Route path="/jadwal-shift" element={<ProtectedRoute />}>
                    <Route index element={<IndexJadwalShift />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
