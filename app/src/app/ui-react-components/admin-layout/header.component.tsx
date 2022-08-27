import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

export const Header: React.FC = () => {

  const sidebarHideClass = useSelector((store: AnitaStore) => store.layout.sidebar)

  const handleClickSidebar = () => {
    storeDispatcher({ type: REDUX_ACTIONS.toggleSidebar });
  }

  return (
    <div className="bg-white text-gray-700 flex h-14 shadow-md justify-between">
      <button className="mobile-menu-button p-4 focus:outline-none  md:hidden" onClick={handleClickSidebar}>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="relative flex items-center lg:w-auto lg:static md:pl-5 -ml-7 md:ml-0">
        <Link to="/" className="text-lg font-bold leading-relaxed inline-block mr-4 py-2 whitespace-no-wrap uppercase">
          <img src={`${process.env.PUBLIC_URL}/assets/logo/logo_square.svg`} style={{ height: '30px', width: 'auto' }} alt="Anita" />
        </Link>
        <Link to="/" className="hidden md:inline-block mr-4 py-2 whitespace-no-wrap text-prussian-blue-400">
          <span className="text-md font-bold leading-relaxed uppercase">Anita</span><sup style={{ fontVariant: 'small-caps' }}>Beta</sup>
        </Link>
      </div>

      <div className="visible md:hidden">&#160;</div>

      {sidebarHideClass === '' && (<div onClick={handleClickSidebar} className="absolute inset-0 h-full w-full z-10 md:hidden"></div>)}

    </div>
  )
}