export const Color = ({ value }) => value
  ? <div className="rounded-full" style={{ backgroundColor: value, width: '25px' }}>&nbsp;</div>
  : null;
