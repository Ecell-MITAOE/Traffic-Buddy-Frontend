import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import authService from "../../services/authService";

const Profile = () => {
	return (
		<SettingSection icon={User} title={"Profile"}>
			<div className='flex flex-col sm:flex-row items-center mb-6'>
				<img
					src='https://pbs.twimg.com/profile_images/1617445332866170881/rebWaCpW_400x400.jpg'
					alt='Profile'
					className='rounded-full w-20 h-20 object-cover mr-4'
				/>

				<div>
					<h3 className='text-lg font-semibold text-tBase'>{localStorage.getItem('username')}</h3>
					<p className='text-tSecondary'></p>
				</div>
			</div>

<div className="flex flex-row gap-3">
			{/* <button className='bg-secondary hover:bg-hovSecondary text-tBase font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'>
				Edit Profile
			</button> */}
			<button onClick={() => {authService.logout();window.location.reload()}} className='bg-red-600 hover:bg-red-700 text-tBase font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'>
				LogOut
			</button>
			</div>
		</SettingSection>
	);
};
export default Profile;
