// START COPYING HERE
import React, { useState, useEffect } from 'react';
import * as api from './apiCall';

export default function MonPage({ user }) {
    const [myMons, setMyMons] = useState([]);

    useEffect(() => {
        if (user && !user.isGuest) {
            // We need to add a new function to our apiCall.js to fetch the user's mons
            api.getUserMons(user.id).then(setMyMons);
        }
    }, [user]);

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">My Mons</h2>
            {myMons.length === 0 ? (
                <p className="text-gray-400 text-center">You haven't collected any mons yet. Complete a typing test to get your first one!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myMons.map((mon) => (
                        <div key={mon.id} className="bg-gray-800 rounded-lg p-6 text-center">
                            <img src={mon.image_url} alt={mon.name} className="w-32 h-32 mx-auto bg-gray-700 rounded-full mb-4" />
                            <h3 className="text-2xl font-bold text-white">{mon.name}</h3>
                            <p className="text-yellow-400">Level {mon.level}</p>
                            <div className="w-full bg-gray-700 rounded-full h-4 my-2">
                                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(mon.experience / (mon.level * 100)) * 100}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-400">{mon.experience} / {mon.level * 100} XP</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
// END COPYING HERE