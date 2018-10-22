import { Dispatch } from 'redux'
import { connect, InferableComponentEnhancerWithProps } from 'react-redux'

type DispatchObj = { dispatch: Dispatch }

function connectMore<
  TStateProps,
  TDispatchProps,
  TOwnProps,
  TMergedProps,
  State
> (
  mapStateToProps: (state: State, ownProps: TOwnProps) => TStateProps,
  mapDispatchToProps: (
    dispatch: Dispatch,
    stateProps: TStateProps
  ) => TDispatchProps,
  mergeProps: (
    stateProps: TStateProps,
    dispatchProps: TDispatchProps
  ) => TMergedProps
): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>
function connectMore<TStateProps, TDispatchProps, TOwnProps, State> (
  mapStateToProps: (state: State, ownProps: TOwnProps) => TStateProps,
  mapDispatchToProps: (
    dispatch: Dispatch,
    stateProps: TStateProps
  ) => TDispatchProps
): InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>

function connectMore<
  TStateProps,
  TDispatchProps,
  TOwnProps,
  TMergedProps,
  State
> (
  mapStateToProps: (state: State, ownProps: TOwnProps) => TStateProps,
  mapDispatchToProps: (
    dispatch: Dispatch,
    stateProps: TStateProps
  ) => TDispatchProps,
  mergeProps?: (
    stateProps: TStateProps,
    dispatchProps: TDispatchProps
  ) => TMergedProps
) {
  if (!mergeProps) {
    type P = TStateProps & TDispatchProps
    return connect<TStateProps, DispatchObj, TOwnProps, P, State>(
      mapStateToProps,
      dispatch => ({ dispatch }),
      (stateProps, { dispatch }) =>
        Object.assign({}, stateProps, mapDispatchToProps(dispatch, stateProps))
    )
  }
  return connect<TStateProps, DispatchObj, TOwnProps, TMergedProps, State>(
    mapStateToProps,
    dispatch => ({ dispatch }),
    (stateProps, { dispatch }) =>
      mergeProps(stateProps, mapDispatchToProps(dispatch, stateProps))
  )
}
export default connectMore
