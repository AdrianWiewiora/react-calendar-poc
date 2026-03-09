// src/components/layout/Topbar.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell, User, Settings, LogOut, FileText } from 'lucide-react';
import './Topbar.scss';

export const Topbar = () => {
    // Stany menu
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [notifications, setNotifications] = useState([
        { id: 1, text: "Nowak D. prosi o urlop 12.03", time: "10 min temu", isRead: false },
        { id: 2, text: "Zatwierdzono grafik na przyszły tydzień", time: "1 godz. temu", isRead: true },
        { id: 3, text: "Nowa maszyna CNC dodana do systemu", time: "Wczoraj", isRead: true },
    ]);

    const notificationsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const hasUnread = notifications.some(notif => !notif.isRead);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        setIsProfileOpen(false);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
        setIsNotificationsOpen(false);
    };

    const markAsRead = (id: number) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
    };
    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif => ({ ...notif, isRead: true }))
        );
    };

    return (
        <header className="topbar">
            <div className="topbar-brand">
                <h1>Kalendarz React</h1>
            </div>

            <div className="topbar-actions">
                <div className="dropdown-container" ref={notificationsRef}>
                    <button className="icon-btn" onClick={toggleNotifications}>
                        <Bell size={20} />
                        {hasUnread && <span className="notification-badge"></span>}
                    </button>

                    {isNotificationsOpen && (
                        <div className="dropdown-menu notifications-menu">
                            <div className="dropdown-header">
                                <h3>Powiadomienia</h3>
                                <button className="text-btn" onClick={markAllAsRead}>Oznacz jako przeczytane</button>
                            </div>
                            <div className="dropdown-list">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`dropdown-item ${!notif.isRead ? 'unread' : ''}`}
                                    >
                                        <div className="item-content">
                                            <p>{notif.text}</p>
                                            <span className="time">{notif.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="dropdown-container" ref={profileRef}>
                    <div className="user-profile" onClick={toggleProfile}>
                        <User size={20} />
                        <span>Jan Kowalski</span>
                    </div>

                    {isProfileOpen && (
                        <div className="dropdown-menu profile-menu">
                            <div className="dropdown-header profile-header">
                                <strong>Jan Kowalski</strong>
                                <span>Kierownik Zmiany</span>
                            </div>
                            <div className="dropdown-list">
                                <a href="#" className="dropdown-item">
                                    <Settings size={16} />
                                    Ustawienia konta
                                </a>
                                <a href="#" className="dropdown-item">
                                    <FileText size={16} />
                                    Moje raporty RCP
                                </a>
                                <div className="divider"></div>
                                <a href="#" className="dropdown-item text-danger">
                                    <LogOut size={16} />
                                    Wyloguj się
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};